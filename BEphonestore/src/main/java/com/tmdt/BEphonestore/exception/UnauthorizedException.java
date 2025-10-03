package com.tmdt.BEphonestore.exception;

/**
 * Unauthorized Exception
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
