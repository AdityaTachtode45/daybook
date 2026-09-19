package com.daybook.service;

import com.cloudinary.Cloudinary;
import com.daybook.dto.*;
import com.daybook.exception.BadRequestException;
import com.daybook.exception.ResourceNotFoundException;
import com.daybook.model.*;
import com.daybook.repository.BucketItemRepository;
import com.daybook.repository.BucketStepRepository;
import com.daybook.repository.ProfileRepository;
import com.daybook.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BucketServiceTest {

    @Mock
    private BucketItemRepository bucketItemRepository;

    @Mock
    private BucketStepRepository bucketStepRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    private Cloudinary cloudinary;

    private BucketService bucketService;

    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        cloudinary = new Cloudinary(Map.of(
                "cloud_name", "demo",
                "api_key", "1234567890",
                "api_secret", "secret"
        ));

        bucketService = new BucketService(
                bucketItemRepository,
                bucketStepRepository,
                userRepository,
                profileRepository,
                cloudinary
        );

        userA = new User("userA@example.com", "hash");
        userA.setId(1L);

        userB = new User("userB@example.com", "hash");
        userB.setId(2L);
    }

    @Test
    void testUserIsolation_CannotAccessOtherUserItem() {
        BucketItem itemA = new BucketItem(userA, "User A's dream");
        itemA.setId(100L);

        when(bucketItemRepository.findByIdAndUserId(100L, userA.getId())).thenReturn(Optional.of(itemA));
        when(bucketItemRepository.findByIdAndUserId(100L, userB.getId())).thenReturn(Optional.empty());

        // User A gets item successfully
        BucketItemResponseDto response = bucketService.getItemById(userA.getId(), 100L);
        assertNotNull(response);
        assertEquals("User A's dream", response.getTitle());

        // User B requesting User A's item gets ResourceNotFoundException
        assertThrows(ResourceNotFoundException.class, () -> {
            bucketService.getItemById(userB.getId(), 100L);
        });
    }

    @Test
    void testReorderValidation_RejectsOtherUsersItems() {
        BucketItem itemA = new BucketItem(userA, "Item A");
        itemA.setId(10L);

        BucketItem itemB = new BucketItem(userB, "Item B");
        itemB.setId(20L);

        when(bucketItemRepository.findAllById(List.of(10L, 20L))).thenReturn(List.of(itemA, itemB));

        List<BucketReorderItemDto> reorderList = List.of(
                new BucketReorderItemDto(10L, BucketStatus.IN_PROGRESS, 0),
                new BucketReorderItemDto(20L, BucketStatus.IN_PROGRESS, 1)
        );

        // User A trying to reorder both should fail due to user B's item
        assertThrows(BadRequestException.class, () -> {
            bucketService.reorderItems(userA.getId(), reorderList);
        });

        verify(bucketItemRepository, never()).saveAll(any());
    }

    @Test
    void testCompleteAndReopenRules_FutureDateRejected() {
        BucketItem item = new BucketItem(userA, "Visit Japan");
        item.setId(1L);

        when(bucketItemRepository.findByIdAndUserId(1L, userA.getId())).thenReturn(Optional.of(item));
        when(profileRepository.findByUserId(userA.getId())).thenReturn(Optional.empty()); // defaults to UTC

        LocalDate futureDate = LocalDate.now().plusDays(2);
        BucketCompleteRequestDto completeRequest = new BucketCompleteRequestDto(futureDate, "Felt awesome!");

        // Expect BadRequestException when completing with future date
        assertThrows(BadRequestException.class, () -> {
            bucketService.completeItem(userA.getId(), 1L, completeRequest);
        });
    }

    @Test
    void testCompleteAndReopenRules_SuccessAndReopen() {
        BucketItem item = new BucketItem(userA, "Visit Japan");
        item.setId(1L);
        item.setStatus(BucketStatus.IN_PROGRESS);

        BucketStep step = new BucketStep(item, userA, "Book tickets");
        step.setId(5L);
        step.setDone(false);
        item.getSteps().add(step);

        when(bucketItemRepository.findByIdAndUserId(1L, userA.getId())).thenReturn(Optional.of(item));
        when(profileRepository.findByUserId(userA.getId())).thenReturn(Optional.empty());
        when(bucketItemRepository.save(any(BucketItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LocalDate today = LocalDate.now();
        BucketCompleteRequestDto request = new BucketCompleteRequestDto(today, "Dream fulfilled!");

        BucketItemResponseDto result = bucketService.completeItem(userA.getId(), 1L, request);

        assertEquals(BucketStatus.DONE, result.getStatus());
        assertEquals(today, result.getCompletedDate());
        assertEquals("Dream fulfilled!", result.getCompletedNote());
        assertTrue(step.isDone()); // Remaining step marked done

        // Test Reopen
        BucketItemResponseDto reopened = bucketService.reopenItem(userA.getId(), 1L);
        assertEquals(BucketStatus.IN_PROGRESS, reopened.getStatus());
        assertNull(reopened.getCompletedDate());
        assertNull(reopened.getCompletedNote());
    }

    @Test
    void testStepDrivenStatusChange_FirstStepCheckedMovesDreamingToInProgress() {
        BucketItem item = new BucketItem(userA, "Learn Rust");
        item.setId(2L);
        item.setStatus(BucketStatus.DREAMING);

        BucketStep step = new BucketStep(item, userA, "Read book");
        step.setId(20L);
        step.setDone(false);

        when(bucketStepRepository.findByIdAndUserId(20L, userA.getId())).thenReturn(Optional.of(step));
        when(bucketStepRepository.save(any(BucketStep.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BucketStepRequestDto request = new BucketStepRequestDto();
        request.setDone(true);

        bucketService.updateStep(userA.getId(), 20L, request);

        // Status moved to IN_PROGRESS
        assertEquals(BucketStatus.IN_PROGRESS, item.getStatus());
        verify(bucketItemRepository, times(1)).save(item);
    }

    @Test
    void testStatsNumbersCalculation() {
        when(bucketItemRepository.countByUserId(userA.getId())).thenReturn(10L);
        when(bucketItemRepository.countByUserIdAndStatus(userA.getId(), BucketStatus.DREAMING)).thenReturn(4L);
        when(bucketItemRepository.countByUserIdAndStatus(userA.getId(), BucketStatus.IN_PROGRESS)).thenReturn(3L);
        when(bucketItemRepository.countByUserIdAndStatus(userA.getId(), BucketStatus.DONE)).thenReturn(3L);
        when(bucketItemRepository.countByUserIdAndStatusAndCompletedDateBetween(eq(userA.getId()), eq(BucketStatus.DONE), any(), any())).thenReturn(2L);
        when(profileRepository.findByUserId(userA.getId())).thenReturn(Optional.empty());

        BucketItem item1 = new BucketItem(userA, "In Progress 1");
        item1.setId(101L);
        item1.setStatus(BucketStatus.IN_PROGRESS);

        when(bucketItemRepository.findByUserId(userA.getId())).thenReturn(List.of(item1));

        BucketStatsDto stats = bucketService.getStats(userA.getId());

        assertEquals(10L, stats.getTotal());
        assertEquals(3L, stats.getDone());
        assertEquals(3L, stats.getInProgress());
        assertEquals(4L, stats.getDreaming());
        assertEquals(30, stats.getCompletionPercent()); // 3/10 * 100
        assertEquals(2L, stats.getDoneThisYear());
        assertEquals(9, stats.getByCategory().size()); // 9 categories
        assertEquals(1, stats.getNextUp().size());
        assertEquals("In Progress 1", stats.getNextUp().get(0).getTitle());
    }

    @Test
    void testByDateAndCompletedDatesEndpoints() {
        LocalDate testDate = LocalDate.of(2026, 9, 19);

        BucketItem completedItem = new BucketItem(userA, "Scuba diving");
        completedItem.setId(50L);
        completedItem.setCategory(BucketCategory.ADVENTURE);
        completedItem.setCoverUrl("https://cloudinary.com/image.jpg");
        completedItem.setCompletedNote("Amazing underwater experience");

        when(bucketItemRepository.findByUserIdAndCompletedDate(userA.getId(), testDate))
                .thenReturn(List.of(completedItem));

        List<BucketByDateDto> byDateResults = bucketService.getItemsByDate(userA.getId(), testDate);
        assertEquals(1, byDateResults.size());
        assertEquals("Scuba diving", byDateResults.get(0).getTitle());
        assertEquals(BucketCategory.ADVENTURE, byDateResults.get(0).getCategory());

        // Test completed-dates
        Object[] rawCount = new Object[]{ testDate, 2L };
        List<Object[]> rawList = new ArrayList<>();
        rawList.add(rawCount);

        when(bucketItemRepository.countCompletedByDateGrouped(eq(userA.getId()), any(), any()))
                .thenReturn(rawList);

        List<BucketCompletedDateCountDto> completedDates = bucketService.getCompletedDates(userA.getId(), 2026, 9);
        assertEquals(1, completedDates.size());
        assertEquals(testDate, completedDates.get(0).getDate());
        assertEquals(2L, completedDates.get(0).getCount());
    }
}
