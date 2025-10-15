package com.eaut.backend.Model.Response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Value;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiReponse<T> {
    private int code;
    private String message;
    private Boolean status;
    private T data;

    public ApiReponse(int value, T data) {
        this.code = value;
        this.data = data;
    }

}
