package com.eaut.backend.service.mailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class MailConsumer {
    private final JavaMailSender mailSender;

    public MailConsumer(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @KafkaListener(topics = "otp-mail-topic", groupId = "mail-group")
    public void consumeOtpMail(String message) {
        try {
            String[] parts = message.split("\\|");
            String to = parts[0];
            String otp = parts[1];
            sendOtpEmail(to, otp);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @KafkaListener(topics = "forgot-password-topic", groupId = "mail-group")
    public void consumeForgotPasswordMail(String message) {
        try {
            String[] parts = message.split("\\|");
            String to = parts[0];
            String otp = parts[1]; // ✅ Chỉ cần OTP thay vì resetToken
            sendForgotPasswordEmail(to, otp);
        } catch (Exception e) {
            System.err.println("❌ Failed to send forgot password email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @KafkaListener(topics = "order-confirmation-topic", groupId = "mail-group")
    public void consumeOrderConfirmationMail(String message) {
        try {
            String[] parts = message.split("\\|");
            String to = parts[0];
            String orderNumber = parts[1];
            String customerName = parts[2];
            String totalAmount = parts[3];
            String orderItems = parts[4]; // HTML string
            sendOrderConfirmationEmail(to, orderNumber, customerName, totalAmount, orderItems);
        } catch (Exception e) {
            System.err.println("❌ Failed to send order confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @KafkaListener(topics = "order-cancellation-topic", groupId = "mail-group")
    public void consumeOrderCancellationMail(String message) {
        System.out.println("Consumer: Processing order cancellation message: " + message);
        try {
            String[] parts = message.split("\\|");
            if (parts.length >= 4) {
                String toEmail = parts[0];
                String orderNumber = parts[1];
                String customerName = parts[2];
                String reason = parts[3];

                sendOrderCancellationEmail(toEmail, orderNumber, customerName, reason);
            } else {
                System.err.println("Invalid message format for order-cancellation-topic: " + message);
            }
        } catch (Exception e) {
            System.err.println("Failed to process order cancellation message: " + message + e.getMessage());
        }
    }

    @KafkaListener(topics = "tradein-status-topic", groupId = "mail-group")
    public void consumeTradeInStatusMail(String message) {
        System.out.println("Consumer: Processing trade-in status message: " + message);
        try {
            // Format: email|customerName|diagnosticId|status|staffMessage
            String[] parts = message.split("\\|", 5);
            if (parts.length >= 4) {
                String toEmail = parts[0];
                String customerName = parts[1];
                String diagnosticId = parts[2];
                String status = parts[3];
                String staffMessage = parts.length >= 5 ? parts[4] : "";
                sendTradeInStatusEmail(toEmail, customerName, diagnosticId, status, staffMessage);
            } else {
                System.err.println("Invalid message format for tradein-status-topic: " + message);
            }
        } catch (Exception e) {
            System.err.println("Failed to process trade-in status message: " + e.getMessage());
        }
    }

    private void sendTradeInStatusEmail(String toEmail, String customerName, String diagnosticId,
            String status, String staffMessage)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setFrom("tradein@buysellphone.com", "BuySellPhone Trade-In");
        helper.setTo(toEmail);

        String subject;
        String htmlContent;

        switch (status) {
            case "processing":
                subject = "📞 Yêu Cầu Thu Cũ Đang Được Xử Lý - BuySellPhone";
                htmlContent = createTradeInProcessingEmailTemplate(customerName, diagnosticId, staffMessage);
                break;
            case "completed":
                subject = "✅ Yêu Cầu Thu Cũ Hoàn Thành - BuySellPhone";
                htmlContent = createTradeInCompletedEmailTemplate(customerName, diagnosticId, staffMessage);
                break;
            case "cancelled":
                subject = "❌ Yêu Cầu Thu Cũ Đã Bị Hủy - BuySellPhone";
                htmlContent = createTradeInCancelledEmailTemplate(customerName, diagnosticId, staffMessage);
                break;
            default:
                System.err.println("Unknown trade-in status for email: " + status);
                return;
        }

        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(mimeMessage);
        System.out.println("Sent trade-in " + status + " email to " + toEmail);
    }

    private String createTradeInProcessingEmailTemplate(String customerName, String diagnosticId, String staffMessage) {
        String time = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String msgBlock = (staffMessage != null && !staffMessage.isBlank())
                ? "<div style=\"background:#e8f4fd;border-left:4px solid #2196F3;padding:14px 18px;border-radius:6px;margin:20px 0;\">"
                        + "<p style=\"margin:0;color:#1565C0;font-size:15px;\"><strong>💬 Lời nhắn từ nhân viên:</strong></p>"
                        + "<p style=\"margin:8px 0 0;color:#333;\">" + staffMessage + "</p></div>"
                : "";
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family:Segoe UI,Arial,sans-serif;background:#f5f5f5;margin:0;padding:0'>"
                + "<div style='max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1)'>"
                + "<div style='background:linear-gradient(135deg,#2196F3,#1565C0);padding:28px 24px;text-align:center'>"
                + "<h1 style='color:white;margin:0;font-size:24px'>📞 Yêu Cầu Thu Cũ Đang Được Xử Lý</h1>"
                + "<p style='color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px'>BuySellPhone Trade-In</p></div>"
                + "<div style='padding:30px 24px'>"
                + "<p style='font-size:16px;color:#333'>Xin chào <strong>" + customerName + "</strong>,</p>"
                + "<p style='color:#555;line-height:1.7'>Yêu cầu thu cũ của bạn <strong>#"
                + diagnosticId.substring(0, Math.min(8, diagnosticId.length()))
                + "...</strong> đang được nhân viên xem xét và sẽ liên hệ với bạn sớm.</p>"
                + msgBlock
                + "<p style='color:#555;line-height:1.7'>Vui lòng giữ liên lạc và chuẩn bị thiết bị để nhân viên có thể hỗ trợ tốt nhất.</p>"
                + "<div style='text-align:center;margin:24px 0'><a href='https://buysellphoneold.id.vn/user/profile' style='display:inline-block;background:#2196F3;color:white;text-decoration:none;padding:12px 28px;border-radius:24px;font-weight:600;font-size:15px'>Xem Lịch Sử Thu Cũ</a></div>"
                + "</div><div style='background:#f8f9fa;padding:16px;text-align:center;font-size:12px;color:#888'>© "
                + time.substring(6) + " BuySellPhone — Email tự động, vui lòng không trả lời.</div>"
                + "</div></body></html>";
    }

    private String createTradeInCompletedEmailTemplate(String customerName, String diagnosticId, String staffMessage) {
        String time = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String msgBlock = (staffMessage != null && !staffMessage.isBlank())
                ? "<div style=\"background:#e8f5e9;border-left:4px solid #4CAF50;padding:14px 18px;border-radius:6px;margin:20px 0;\">"
                        + "<p style=\"margin:0;color:#1b5e20;font-size:15px;\"><strong>💬 Ghi chú:</strong></p>"
                        + "<p style=\"margin:8px 0 0;color:#333;\">" + staffMessage + "</p></div>"
                : "";
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family:Segoe UI,Arial,sans-serif;background:#f5f5f5;margin:0;padding:0'>"
                + "<div style='max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1)'>"
                + "<div style='background:linear-gradient(135deg,#43a047,#1b5e20);padding:28px 24px;text-align:center'>"
                + "<h1 style='color:white;margin:0;font-size:24px'>✅ Yêu Cầu Thu Cũ Hoàn Thành!</h1>"
                + "<p style='color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px'>BuySellPhone Trade-In</p></div>"
                + "<div style='padding:30px 24px'>"
                + "<p style='font-size:16px;color:#333'>Xin chào <strong>" + customerName + "</strong>,</p>"
                + "<p style='color:#555;line-height:1.7'>Yêu cầu thu cũ <strong>#"
                + diagnosticId.substring(0, Math.min(8, diagnosticId.length()))
                + "...</strong> đã được <strong style='color:#43a047'>hoàn tất</strong>. Cảm ơn bạn đã tin tưởng BuySellPhone!</p>"
                + msgBlock
                + "<div style='text-align:center;margin:24px 0'><a href='https://buysellphoneold.id.vn/user/profile' style='display:inline-block;background:#43a047;color:white;text-decoration:none;padding:12px 28px;border-radius:24px;font-weight:600;font-size:15px'>Xem Lịch Sử Thu Cũ</a></div>"
                + "</div><div style='background:#f8f9fa;padding:16px;text-align:center;font-size:12px;color:#888'>© "
                + time.substring(6) + " BuySellPhone — Email tự động, vui lòng không trả lời.</div>"
                + "</div></body></html>";
    }

    private String createTradeInCancelledEmailTemplate(String customerName, String diagnosticId, String staffMessage) {
        String time = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String msgBlock = (staffMessage != null && !staffMessage.isBlank())
                ? "<div style=\"background:#fdecea;border-left:4px solid #f44336;padding:14px 18px;border-radius:6px;margin:20px 0;\">"
                        + "<p style=\"margin:0;color:#b71c1c;font-size:15px;\"><strong>📋 Lý do hủy:</strong></p>"
                        + "<p style=\"margin:8px 0 0;color:#333;\">" + staffMessage + "</p></div>"
                : "";
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family:Segoe UI,Arial,sans-serif;background:#f5f5f5;margin:0;padding:0'>"
                + "<div style='max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1)'>"
                + "<div style='background:linear-gradient(135deg,#e53935,#b71c1c);padding:28px 24px;text-align:center'>"
                + "<h1 style='color:white;margin:0;font-size:24px'>❌ Yêu Cầu Thu Cũ Đã Bị Hủy</h1>"
                + "<p style='color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px'>BuySellPhone Trade-In</p></div>"
                + "<div style='padding:30px 24px'>"
                + "<p style='font-size:16px;color:#333'>Xin chào <strong>" + customerName + "</strong>,</p>"
                + "<p style='color:#555;line-height:1.7'>Yêu cầu thu cũ <strong>#"
                + diagnosticId.substring(0, Math.min(8, diagnosticId.length()))
                + "...</strong> đã bị <strong style='color:#e53935'>hủy</strong>.</p>"
                + msgBlock
                + "<p style='color:#555;line-height:1.7'>Nếu bạn có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi.</p>"
                + "<div style='text-align:center;margin:24px 0'><a href='https://buysellphoneold.id.vn/user/profile' style='display:inline-block;background:#e53935;color:white;text-decoration:none;padding:12px 28px;border-radius:24px;font-weight:600;font-size:15px'>Xem Lịch Sử Thu Cũ</a></div>"
                + "</div><div style='background:#f8f9fa;padding:16px;text-align:center;font-size:12px;color:#888'>© "
                + time.substring(6) + " BuySellPhone — Email tự động, vui lòng không trả lời.</div>"
                + "</div></body></html>";
    }

    private void sendOrderCancellationEmail(String toAddress, String orderCode, String customerName, String reason)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setFrom("orders@buysellphone.com", "BuySellPhone Orders");
        helper.setTo(toAddress);
        helper.setSubject("Thông Báo Hủy Đơn Hàng " + orderCode + " - BuySellPhone");

        String htmlContent = createOrderCancellationEmailTemplate(orderCode, customerName, reason);
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
        System.out.println("Sent cancellation email for order: " + orderCode + " to " + toAddress);
    }

    private String createOrderCancellationEmailTemplate(String orderNumber, String customerName, String reason) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <style>\n" +
                "        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }\n"
                +
                "        .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }\n"
                +
                "        .header { background-color: #dc3545; color: white; padding: 30px 20px; text-align: center; }\n"
                +
                "        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }\n" +
                "        .content { padding: 30px; }\n" +
                "        .greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #2c3e50; }\n" +
                "        .message-box { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin-bottom: 25px; border-radius: 4px; }\n"
                +
                "        .message-box p { margin: 0; color: #721c24; }\n" +
                "        .order-details { background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 25px; }\n"
                +
                "        .order-details p { margin: 5px 0; }\n" +
                "        .order-details strong { color: #555; }\n" +
                "        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef; }\n"
                +
                "        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }\n"
                +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"email-container\">\n" +
                "        <div class=\"header\">\n" +
                "            <h1>Thông Báo Hủy Đơn Hàng</h1>\n" +
                "        </div>\n" +
                "        <div class=\"content\">\n" +
                "            <div class=\"greeting\">\n" +
                "                Xin chào " + customerName + ",\n" +
                "            </div>\n" +
                "            \n" +
                "            <div class=\"message-box\">\n" +
                "                <p>Đơn hàng của bạn đã được hủy thành công theo yêu cầu.</p>\n" +
                "            </div>\n" +
                "            \n" +
                "            <p>Dưới đây là thông tin đơn hàng đã hủy:</p>\n" +
                "            \n" +
                "            <div class=\"order-details\">\n" +
                "                <p><strong>Mã đơn hàng:</strong> " + orderNumber + "</p>\n" +
                "                <p><strong>Lý do hủy:</strong> " + reason + "</p>\n" +
                "                <p><strong>Trạng thái hiện tại:</strong> <span style=\"color:#dc3545;font-weight:bold;\">Đã hủy</span></p>\n"
                +
                "            </div>\n" +
                "            \n" +
                "            <p>Nếu bạn đã thanh toán, hệ thống sẽ chờ lệnh và hoàn tiền vào tài khoản ngân hàng của bạn trong vòng 3-5 ngày làm việc.</p>\n"
                +
                "            \n" +
                "            <p>Mọi thắc mắc vui lòng liên hệ hotline/email bộ phận CSKH để được hỗ trợ.</p>\n" +
                "            <p>Cảm ơn bạn đã đồng hành cùng BuySellPhoneOld!</p>\n" +
                "            \n" +
                "            <div style=\"text-align: center;\">\n" +
                "                <a href=\"https://buysellphoneold.id.vn/\" class=\"button\">Truy Cập Trang Chủ</a>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        <div class=\"footer\">\n" +
                "            <p>Email này được tạo tự động, vui lòng không trả lời.</p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }
    //
    // @KafkaListener(topics = "shipping-notification-topic", groupId =
    // "mail-group")
    // public void consumeShippingNotificationMail(String message) {
    // try {
    // String[] parts = message.split("\\|");
    // String to = parts[0];
    // String orderNumber = parts[1];
    // String customerName = parts[2];
    // String trackingNumber = parts[3];
    // String estimatedDelivery = parts[4];
    // sendShippingNotificationEmail(to, orderNumber, customerName, trackingNumber,
    // estimatedDelivery);
    // } catch (Exception e) {
    // System.err.println("❌ Failed to send shipping notification email: " +
    // e.getMessage());
    // e.printStackTrace();
    // }
    // }
    //
    // @KafkaListener(topics = "delivery-confirmation-topic", groupId =
    // "mail-group")
    // public void consumeDeliveryConfirmationMail(String message) {
    // try {
    // String[] parts = message.split("\\|");
    // String to = parts[0];
    // String orderNumber = parts[1];
    // String customerName = parts[2];
    // String deliveryDate = parts[3];
    // sendDeliveryConfirmationEmail(to, orderNumber, customerName, deliveryDate);
    // } catch (Exception e) {
    // System.err.println("❌ Failed to send delivery confirmation email: " +
    // e.getMessage());
    // e.printStackTrace();
    // }
    // }

    // 1. EMAIL OTP XÁC THỰC
    private void sendOtpEmail(String to, String otp) throws MessagingException, UnsupportedEncodingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("🔐 Mã OTP Xác Thực Tài Khoản - BuySellPhone");
        helper.setFrom("noreply@buysellphone.com", "BuySellPhone Team");

        String htmlContent = createOtpEmailTemplate(otp, to);
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
        System.out.println("✅ Sent OTP email to " + to);
    }

    // 2. EMAIL QUÊN MẬT KHẨU - ✅ Đơn giản hóa chỉ cần OTP và email
    private void sendForgotPasswordEmail(String to, String otp)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("🔑 Mã OTP Đặt Lại Mật Khẩu - BuySellPhone");
        helper.setFrom("noreply@buysellphone.com", "BuySellPhone Team");

        String htmlContent = createForgotPasswordEmailTemplate(otp, to);
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
        System.out.println("✅ Sent forgot password OTP email to " + to);
    }

    // 3. EMAIL XÁC NHẬN ĐƠN HÀNG
    private void sendOrderConfirmationEmail(String to, String orderNumber, String customerName,
            String totalAmount, String orderItems) throws MessagingException, UnsupportedEncodingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("✅ Xác Nhận Đơn Hàng #" + orderNumber + " - BuySellPhone");
        helper.setFrom("orders@buysellphone.com", "BuySellPhone Orders");

        String htmlContent = createOrderConfirmationEmailTemplate(orderNumber, customerName, totalAmount, orderItems);
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
        System.out.println("✅ Sent order confirmation email to " + to);
    }
    //
    // // 4. EMAIL THÔNG BÁO GIAO HÀNG
    // private void sendShippingNotificationEmail(String to, String orderNumber,
    // String customerName,
    // String trackingNumber, String estimatedDelivery) throws MessagingException {
    // MimeMessage mimeMessage = mailSender.createMimeMessage();
    // MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
    //
    // helper.setTo(to);
    // helper.setSubject("🚚 Đơn Hàng #" + orderNumber + " Đang Được Giao -
    // BuySellPhone");
    // helper.setFrom("shipping@buysellphone.com", "BuySellPhone Shipping");
    //
    // String htmlContent = createShippingNotificationEmailTemplate(orderNumber,
    // customerName, trackingNumber, estimatedDelivery);
    // helper.setText(htmlContent, true);
    //
    // mailSender.send(mimeMessage);
    // System.out.println("✅ Sent shipping notification email to " + to);
    // }
    //
    // // 5. EMAIL XÁC NHẬN GIAO HÀNG THÀNH CÔNG
    // private void sendDeliveryConfirmationEmail(String to, String orderNumber,
    // String customerName,
    // String deliveryDate) throws MessagingException {
    // MimeMessage mimeMessage = mailSender.createMimeMessage();
    // MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
    //
    // helper.setTo(to);
    // helper.setSubject("🎉 Giao Hàng Thành Công #" + orderNumber + " -
    // BuySellPhone");
    // helper.setFrom("delivery@buysellphone.com", "BuySellPhone Delivery");
    //
    // String htmlContent = createDeliveryConfirmationEmailTemplate(orderNumber,
    // customerName, deliveryDate);
    // helper.setText(htmlContent, true);
    //
    // mailSender.send(mimeMessage);
    // System.out.println("✅ Sent delivery confirmation email to " + to);
    // }

    // TEMPLATE 1: OTP XÁC THỰC
    private String createOtpEmailTemplate(String otp, String email) {
        LocalDateTime now = LocalDateTime.now();
        String currentTime = now.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String expiryTime = now.plusMinutes(5).format(DateTimeFormatter.ofPattern("HH:mm"));

        String template = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mã OTP Xác Thực</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
                            <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 15px; border-radius: 50%; margin-bottom: 15px;">
                                <div style="width: 50px; height: 50px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                    <span style="font-size: 24px; color: #667eea;">📱</span>
                                </div>
                            </div>
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">BuySellPhone</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Nền tảng mua bán điện thoại uy tín</p>
                        </div>

                        <!-- Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                🔐 Xác Thực Tài Khoản
                            </h2>

                            <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                Xin chào <strong style="color: #333;">{{EMAIL}}</strong>,
                            </p>

                            <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                Chúng tôi đã nhận được yêu cầu đăng ký tài khoản từ địa chỉ email này.
                                Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP bên dưới:
                            </p>

                            <!-- OTP Box -->
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(102,126,234,0.3);">
                                    <div style="color: gray; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">
                                        {{OTP}}
                                    </div>
                                </div>
                            </div>

                            <!-- Warning Box -->
                            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                                    ⚠️ Lưu ý quan trọng:
                                </h3>
                                <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.5;">
                                    <li>Mã OTP có hiệu lực trong <strong>5 phút</strong> (đến {{EXPIRY_TIME}})</li>
                                    <li>Không chia sẻ mã này với bất kỳ ai</li>
                                    <li>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này</li>
                                </ul>
                            </div>
                        </div>

                        {{FOOTER}}
                    </div>
                </body>
                </html>
                """;

        return template
                .replace("{{EMAIL}}", email)
                .replace("{{OTP}}", otp)
                .replace("{{EXPIRY_TIME}}", expiryTime)
                .replace("{{FOOTER}}", getCommonFooter(currentTime));
    }

    // TEMPLATE 2: QUÊN MẬT KHẨU - ✅ Đơn giản hóa như OTP
    private String createForgotPasswordEmailTemplate(String otp, String email) {
        LocalDateTime now = LocalDateTime.now();
        String currentTime = now.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String expiryTime = now.plusMinutes(15).format(DateTimeFormatter.ofPattern("HH:mm"));

        String template = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mã OTP Đặt Lại Mật Khẩu</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px 20px; text-align: center;">
                            <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 15px; border-radius: 50%; margin-bottom: 15px;">
                                <div style="width: 50px; height: 50px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                    <span style="font-size: 24px; color: #f5576c;">🔑</span>
                                </div>
                            </div>
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">BuySellPhone</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Đặt lại mật khẩu</p>
                        </div>

                        <!-- Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                🔑 Mã OTP Đặt Lại Mật Khẩu
                            </h2>

                            <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                Xin chào <strong style="color: #333;">{{EMAIL}}</strong>,
                            </p>

                            <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                                Vui lòng sử dụng mã OTP bên dưới để xác thực và đặt lại mật khẩu:
                            </p>

                            <!-- OTP Box -->
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(245,87,108,0.3);">
                                    <div style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">
                                        {{OTP}}
                                    </div>
                                </div>
                            </div>

                            <!-- Warning Box -->
                            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                                    ⚠️ Lưu ý quan trọng:
                                </h3>
                                <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.5;">
                                    <li>Mã OTP có hiệu lực trong <strong>15 phút</strong> (đến {{EXPIRY_TIME}})</li>
                                    <li>Không chia sẻ mã này với bất kỳ ai</li>
                                    <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                                    <li>Sau khi xác thực OTP, bạn sẽ có thể tạo mật khẩu mới</li>
                                </ul>
                            </div>

                            <!-- Info Box -->
                            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                                    📝 Hướng dẫn đặt lại mật khẩu:
                                </h3>
                                <ol style="color: #0c5460; margin: 0; padding-left: 20px; line-height: 1.5;">
                                    <li>Nhập mã OTP trên vào form xác thực</li>
                                    <li>Tạo mật khẩu mới (tối thiểu 6 ký tự)</li>
                                    <li>Xác nhận mật khẩu mới</li>
                                    <li>Hoàn tất và đăng nhập với mật khẩu mới</li>
                                </ol>
                            </div>
                        </div>

                        {{FOOTER}}
                    </div>
                </body>
                </html>
                """;

        return template
                .replace("{{EMAIL}}", email)
                .replace("{{OTP}}", otp)
                .replace("{{EXPIRY_TIME}}", expiryTime)
                .replace("{{FOOTER}}", getCommonFooter(currentTime));
    }

    // TEMPLATE 3: XÁC NHẬN ĐƠN HÀNG
    private String createOrderConfirmationEmailTemplate(String orderNumber,
            String customerName,
            String totalAmount, String orderItems) {
        LocalDateTime now = LocalDateTime.now();
        String currentTime = now.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String estimatedDelivery = now.plusDays(3).format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        String template = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Xác Nhận Đơn Hàng</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px 20px; text-align: center;">
                            <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 15px; border-radius: 50%; margin-bottom: 15px;">
                                <div style="width: 50px; height: 50px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                    <span style="font-size: 24px; color: #4facfe;">🛒</span>
                                </div>
                            </div>
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">BuySellPhone</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Xác nhận đơn hàng</p>
                        </div>

                        <!-- Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                ✅ Đơn Hàng Đã Được Xác Nhận
                            </h2>

                            <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                Xin chào <strong style="color: #333;">{{CUSTOMER_NAME}}</strong>,
                            </p>

                            <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                Cảm ơn bạn đã đặt hàng tại BuySellPhone! Đơn hàng của bạn đã được xác nhận và
                                đang được xử lý.
                            </p>

                            <!-- Order Info Box -->
                            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6;
                                border-radius: 8px; padding: 25px; margin: 25px 0;">
                                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; font-weight:
                                    600;">
                                    📦 Thông Tin Đơn Hàng
                                </h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #666; font-weight: 600;">Mã đơn hàng:</td>
                                        <td style="padding: 8px 0; color: #333; font-family:
                                            monospace;">#{{ORDER_NUMBER}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666; font-weight: 600;">Ngày đặt:</td>
                                        <td style="padding: 8px 0; color: #333;">{{CURRENT_TIME}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666; font-weight: 600;">Tổng tiền:</td>
                                        <td style="padding: 8px 0; color: #28a745; font-weight: bold; font-size:
                                            18px;">{{TOTAL_AMOUNT}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666; font-weight: 600;">Dự kiến giao:</td>
                                        <td style="padding: 8px 0; color: #333;">{{ESTIMATED_DELIVERY}}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Items -->
                            <div style="background-color: #ffffff; border: 1px solid #dee2e6;
                                border-radius: 8px; padding: 25px; margin: 25px 0;">
                                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; font-weight:
                                    600;">
                                    📱 Sản Phẩm Đã Đặt
                                </h3>
                                <div style="color: #666; line-height: 1.6;">
                                    {{ORDER_ITEMS}}
                                </div>
                            </div>

                            <!-- Track Order Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://buysellphoneold.id.vn/user/profile#profile-orders"
                                   style="display: inline-block; background: linear-gradient(135deg, #4facfe 0%,
                                       #00f2fe 100%); color: white; text-decoration: none; padding: 15px 30px;
                                       border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px
                                       15px rgba(79,172,254,0.3);">
                                    📦 Theo Dõi Đơn Hàng
                                </a>
                            </div>
                        </div>

                        {{FOOTER}}
                    </div>
                </body>
                </html>
                """;

        return template
                .replace("{{CUSTOMER_NAME}}", customerName)
                .replace("{{ORDER_NUMBER}}", orderNumber)
                .replace("{{TOTAL_AMOUNT}}", totalAmount)
                .replace("{{ORDER_ITEMS}}", orderItems)
                .replace("{{CURRENT_TIME}}", currentTime)
                .replace("{{ESTIMATED_DELIVERY}}", estimatedDelivery)
                .replace("{{FOOTER}}", getCommonFooter(currentTime));
    }

    // TEMPLATE 4: THÔNG BÁO GIAO HÀNG
    // private String createShippingNotificationEmailTemplate(String orderNumber,
    // String customerName,
    // String trackingNumber, String estimatedDelivery) {
    // LocalDateTime now = LocalDateTime.now();
    // String currentTime = now.format(DateTimeFormatter.ofPattern("dd/MM/yyyy
    // HH:mm"));
    // String trackingLink = "https://shipping.vn/track/" + trackingNumber;
    //
    // String template = """
    // <!DOCTYPE html>
    // <html lang="vi">
    // <head>
    // <meta charset="UTF-8">
    // <meta name="viewport" content="width=device-width, initial-scale=1.0">
    // <title>Thông Báo Giao Hàng</title>
    // </head>
    // <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva,
    // Verdana, sans-serif; background-color: #f5f5f5;">
    // <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;
    // box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    //
    // <!-- Header -->
    // <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    // padding: 30px 20px; text-align: center;">
    // <div style="display: inline-block; background-color: rgba(255,255,255,0.2);
    // padding: 15px; border-radius: 50%; margin-bottom: 15px;">
    // <div style="width: 50px; height: 50px; background-color: white;
    // border-radius: 50%; display: flex; align-items: center; justify-content:
    // center; margin: 0 auto;">
    // <span style="font-size: 24px; color: #fa709a;">🚚</span>
    // </div>
    // </div>
    // <h1 style="color: white; margin: 0; font-size: 28px; font-weight:
    // 300;">BuySellPhone</h1>
    // <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size:
    // 14px;">Đơn hàng đang được giao</p>
    // </div>
    //
    // <!-- Content -->
    // <div style="padding: 40px 30px;">
    // <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight:
    // 600;">
    // 🚚 Đơn Hàng Đang Được Giao
    // </h2>
    //
    // <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0; font-size:
    // 16px;">
    // Xin chào <strong style="color: #333;">{{CUSTOMER_NAME}}</strong>,
    // </p>
    //
    // <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size:
    // 16px;">
    // Tin tốt! Đơn hàng <strong>#{{ORDER_NUMBER}}</strong> của bạn đã được giao cho
    // đơn vị vận chuyển và đang trên đường đến tay bạn.
    // </p>
    //
    // <!-- Shipping Info Box -->
    // <div style="background-color: #fff3cd; border: 1px solid #ffeaa7;
    // border-radius: 8px; padding: 25px; margin: 25px 0;">
    // <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px; font-weight:
    // 600;">
    // 📦 Thông Tin Vận Chuyển
    // </h3>
    // <table style="width: 100%; border-collapse: collapse;">
    // <tr>
    // <td style="padding: 8px 0; color: #856404; font-weight: 600;">Mã vận
    // đơn:</td>
    // <td style="padding: 8px 0; color: #333; font-family: monospace; font-weight:
    // bold;">{{TRACKING_NUMBER}}</td>
    // </tr>
    // <tr>
    // <td style="padding: 8px 0; color: #856404; font-weight: 600;">Dự kiến
    // giao:</td>
    // <td style="padding: 8px 0; color: #333; font-weight:
    // bold;">{{ESTIMATED_DELIVERY}}</td>
    // </tr>
    // <tr>
    // <td style="padding: 8px 0; color: #856404; font-weight: 600;">Trạng
    // thái:</td>
    // <td style="padding: 8px 0; color: #28a745; font-weight: bold;">Đang vận
    // chuyển</td>
    // </tr>
    // </table>
    // </div>
    //
    // <!-- Track Package Button -->
    // <div style="text-align: center; margin: 30px 0;">
    // <a href="{{TRACKING_LINK}}" style="display: inline-block; background:
    // linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;
    // text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight:
    // 600; font-size: 16px; box-shadow: 0 4px 15px rgba(250,112,154,0.3);">
    // 📍 Theo Dõi Vận Đơn
    // </a>
    // </div>
    //
    // <div style="background-color: #d1ecf1; border: 1px solid #bee5eb;
    // border-radius: 8px; padding: 20px; margin: 25px 0;">
    // <h3 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px; font-weight:
    // 600;">
    // 📞 Lưu ý khi nhận hàng:
    // </h3>
    // <ul style="color: #0c5460; margin: 0; padding-left: 20px; line-height: 1.5;">
    // <li>Vui lòng kiểm tra kỹ sản phẩm trước khi nhận</li>
    // <li>Giữ lại biên lai giao hàng</li>
    // <li>Liên hệ hotline nếu có vấn đề</li>
    // </ul>
    // </div>
    // </div>
    //
    // {{FOOTER}}
    // </div>
    // </body>
    // </html>
    // """;
    //
    // return template
    // .replace("{{CUSTOMER_NAME}}", customerName)
    // .replace("{{ORDER_NUMBER}}", orderNumber)
    // .replace("{{TRACKING_NUMBER}}", trackingNumber)
    // .replace("{{ESTIMATED_DELIVERY}}", estimatedDelivery)
    // .replace("{{TRACKING_LINK}}", trackingLink)
    // .replace("{{FOOTER}}", getCommonFooter(currentTime));
    // }
    //
    // // TEMPLATE 5: XÁC NHẬN GIAO HÀNG THÀNH CÔNG
    // private String createDeliveryConfirmationEmailTemplate(String orderNumber,
    // String customerName, String deliveryDate) {
    // LocalDateTime now = LocalDateTime.now();
    // String currentTime = now.format(DateTimeFormatter.ofPattern("dd/MM/yyyy
    // HH:mm"));
    //
    // String template = """
    // <!DOCTYPE html>
    // <html lang="vi">
    // <head>
    // <meta charset="UTF-8">
    // <meta name="viewport" content="width=device-width, initial-scale=1.0">
    // <title>Giao Hàng Thành Công</title>
    // </head>
    // <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva,
    // Verdana, sans-serif; background-color: #f5f5f5;">
    // <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;
    // box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    //
    // <!-- Header -->
    // <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    // padding: 30px 20px; text-align: center;">
    // <div style="display: inline-block; background-color: rgba(255,255,255,0.2);
    // padding: 15px; border-radius: 50%; margin-bottom: 15px;">
    // <div style="width: 50px; height: 50px; background-color: white;
    // border-radius: 50%; display: flex; align-items: center; justify-content:
    // center; margin: 0 auto;">
    // <span style="font-size: 24px; color: #43e97b;">🎉</span>
    // </div>
    // </div>
    // <h1 style="color: white; margin: 0; font-size: 28px; font-weight:
    // 300;">BuySellPhone</h1>
    // <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size:
    // 14px;">Giao hàng thành công</p>
    // </div>
    //
    // <!-- Content -->
    // <div style="padding: 40px 30px;">
    // <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight:
    // 600;">
    // 🎉 Giao Hàng Thành Công!
    // </h2>
    //
    // <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0; font-size:
    // 16px;">
    // Xin chào <strong style="color: #333;">{{CUSTOMER_NAME}}</strong>,
    // </p>
    //
    // <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size:
    // 16px;">
    // Tuyệt vời! Đơn hàng <strong>#{{ORDER_NUMBER}}</strong> đã được giao thành
    // công vào ngày <strong>{{DELIVERY_DATE}}</strong>.
    // </p>
    //
    // <!-- Success Box -->
    // <div style="background-color: #d4edda; border: 1px solid #c3e6cb;
    // border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
    // <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
    // <h3 style="color: #155724; margin: 0 0 10px 0; font-size: 20px; font-weight:
    // 600;">
    // Đơn hàng đã được giao thành công!
    // </h3>
    // <p style="color: #155724; margin: 0; font-size: 16px;">
    // Cảm ơn bạn đã tin tướng và mua sắm tại BuySellPhone
    // </p>
    // </div>
    //
    // <!-- Rating Request -->
    // <div style="background-color: #f8f9fa; border: 1px solid #dee2e6;
    // border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
    // <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; font-weight:
    // 600;">
    // ⭐ Đánh Giá Trải Nghiệm
    // </h3>
    // <p style="color: #666; margin: 0 0 20px 0; line-height: 1.5;">
    // Bạn có hài lòng với sản phẩm và dịch vụ của chúng tôi không?<br>
    // Đánh giá của bạn sẽ giúp chúng tôi cải thiện chất lượng dịch vụ.
    // </p>
    // <div style="margin: 20px 0;">
    // <a href="https://buysellphone.com/review/{{ORDER_NUMBER}}" style="display:
    // inline-block; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    // color: white; text-decoration: none; padding: 12px 25px; border-radius: 20px;
    // font-weight: 600; font-size: 14px; margin: 0 5px;">
    // ⭐ Đánh Giá Ngay
    // </a>
    // </div>
    // </div>
    //
    // <!-- Warranty Info -->
    // <div style="background-color: #d1ecf1; border: 1px solid #bee5eb;
    // border-radius: 8px; padding: 20px; margin: 25px 0;">
    // <h3 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px; font-weight:
    // 600;">
    // 🛡️ Thông tin bảo hành:
    // </h3>
    // <ul style="color: #0c5460; margin: 0; padding-left: 20px; line-height: 1.5;">
    // <li>Sản phẩm được bảo hành chính hãng</li>
    // <li>Hỗ trợ đổi trả trong 7 ngày đầu</li>
    // <li>Hotline hỗ trợ: 1900-xxxx</li>
    // </ul>
    // </div>
    // </div>
    //
    // {{FOOTER}}
    // </div>
    // </body>
    // </html>
    // """;
    //
    // return template
    // .replace("{{CUSTOMER_NAME}}", customerName)
    // .replace("{{ORDER_NUMBER}}", orderNumber)
    // .replace("{{DELIVERY_DATE}}", deliveryDate)
    // .replace("{{FOOTER}}", getCommonFooter(currentTime));
    // }

    // COMMON FOOTER
    private String getCommonFooter(String currentTime) {
        return """
                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #eee;">
                    <div style="text-align: center;">
                        <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                            Email được gửi lúc: <strong>{{CURRENT_TIME}}</strong>
                        </p>
                        <p style="color: #999; font-size: 12px; line-height: 1.4; margin: 0;">
                            © 2024 BuySellPhone. Tất cả quyền được bảo lưu.<br>
                            Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM<br>
                            Hotline: 1900-xxxx | Email: support@buysellphone.com
                        </p>

                        <!-- Social Links -->
                        <div style="margin-top: 15px;">
                            <a href="#" style="display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none; font-size: 18px;">📘</a>
                            <a href="#" style="display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none, font-size: 18px;">📷</a>
                            <a href="#" style="display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none, font-size: 18px;">🐦</a>
                        </div>
                    </div>
                </div>
                """
                .replace("{{CURRENT_TIME}}", currentTime);
    }
}
