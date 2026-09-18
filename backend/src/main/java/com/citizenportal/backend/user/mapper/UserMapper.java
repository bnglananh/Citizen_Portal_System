package com.citizenportal.backend.user.mapper;

import com.citizenportal.backend.user.dto.UserDto;
import com.citizenportal.backend.user.entity.Role;
import com.citizenportal.backend.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .identityCardNumber(user.getIdentityCardNumber())
                .address(user.getAddress())
                .active(user.isActive())
                .roles(user.getRoles() != null
                        ? user.getRoles().stream().map(Role::getName).map(Enum::name).collect(Collectors.toSet())
                        : Collections.emptySet())
                .build();
    }
}
