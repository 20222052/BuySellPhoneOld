package com.eaut.backend.service.AI_ChatBot;

import org.springframework.stereotype.Service;
import java.util.LinkedList;
import java.util.Queue;
import java.util.List;
import java.util.ArrayList;

@Service
public class ChatQueueService {
    // Sử dụng Queue in-memory đơn giản cho Demo.
    // Trong thực tế nến dùng Redis List để scale.
    private final Queue<String> customerQueue = new LinkedList<>();

    /**
     * Thêm user vào hàng đợi hỗ trợ
     */
    public int joinQueue(String sessionId) {
        if (!customerQueue.contains(sessionId)) {
            customerQueue.offer(sessionId);
        }
        return getPosition(sessionId);
    }

    /**
     * Lấy vị trí hiện tại trong hàng đợi (1-based index)
     */
    public int getPosition(String sessionId) {
        int pos = 0;
        for (String s : customerQueue) {
            pos++;
            if (s.equals(sessionId))
                return pos;
        }
        return -1; // Không tìm thấy
    }

    /**
     * Admin/Staff lấy khách hàng đầu tiên ra khỏi hàng đợi để tiếp nhận
     */
    public String popNextCustomer() {
        return customerQueue.poll();
    }

    /**
     * User rời hàng đợi (hủy yêu cầu)
     */
    public void leaveQueue(String sessionId) {
        customerQueue.remove(sessionId);
    }

    public List<String> getAllQueue() {
        return new ArrayList<>(customerQueue);
    }
}
