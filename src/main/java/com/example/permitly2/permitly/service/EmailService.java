package com.example.permitly2.permitly.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendTempPassword(String toEmail, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Permitly – Temporary Password");
        message.setText(
                "Hello!\n\n" +
                        "Your temporary password is:\n" +
                        tempPassword +
                        "\n\nPlease log in and change your password.\n\n" +
                        "— Permitly"
        );

        mailSender.send(message);
    }
}
