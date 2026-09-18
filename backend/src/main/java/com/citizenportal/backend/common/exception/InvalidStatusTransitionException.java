package com.citizenportal.backend.common.exception;

public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(String currentStatus, String targetStatus) {
        super(String.format("Không thể chuyển trạng thái hồ sơ từ '%s' sang '%s'", currentStatus, targetStatus));
    }

    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
