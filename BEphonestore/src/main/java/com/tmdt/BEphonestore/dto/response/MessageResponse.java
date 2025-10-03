package com.tmdt.BEphonestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response chung để trả về thông điệp (ví dụ: đăng ký, đăng xuất, lỗi, ...)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private String message;
    private Object data; // <-- thêm field data để chứa thông tin bổ sung (vd: imageUrl)

    // constructor riêng cho trường hợp chỉ có message
    public MessageResponse(String message) {
        this.message = message;
        this.data = null;
    }
}
