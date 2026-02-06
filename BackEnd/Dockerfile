# ===============================
# Stage 1: Build (Sử dụng Maven và JDK 22)
# ===============================
FROM maven:3.9.6-eclipse-temurin-22 AS build
WORKDIR /app

# 1. Copy pom.xml trước để tận dụng Docker Cache cho dependencies
COPY pom.xml .

# 2. Tải toàn bộ thư viện về (Bước này sẽ được cache nếu pom.xml không đổi)
RUN mvn dependency:go-offline

# 3. Copy source code và build
COPY src ./src
# Build ra file .jar, bỏ qua test để tiết kiệm thời gian build
RUN mvn clean package -DskipTests

# ===============================
# Stage 2: Run (Chỉ cần JRE 22 để chạy - Nhẹ hơn)
# ===============================
FROM eclipse-temurin:22-jre-alpine
WORKDIR /app

# 1. Copy file .jar từ Stage 1 sang
# Lưu ý: Lệnh *.jar sẽ tự bắt đúng tên file bất kể version trong pom.xml thay đổi
COPY --from=build /app/target/*.jar app.jar

# 2. Thiết lập biến môi trường mặc định (Có thể ghi đè khi deploy lên Cloud Run)
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

# 3. Mở cổng 8080 (Cloud Run yêu cầu cổng này)
EXPOSE 8080

# 4. Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]