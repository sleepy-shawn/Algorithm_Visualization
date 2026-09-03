FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# 复制 pom.xml 和源代码
COPY pom.xml .
COPY maven-settings.xml /usr/share/maven/conf/settings.xml
COPY src ./src

# 构建 JAR 包；网络短暂波动时复用依赖缓存自动重试。
RUN --mount=type=cache,target=/root/.m2 \
    for attempt in 1 2 3; do \
      mvn -Dmaven.test.skip=true -Dmaven.wagon.http.retryHandler.count=5 clean package && exit 0; \
    done; \
    exit 1

# 第二阶段：运行时镜像
FROM docker.1ms.run/library/eclipse-temurin:17-jre-jammy

WORKDIR /app

# 从构建阶段复制 JAR
COPY --from=builder /app/target/algorithm-viz-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
