-- Adminer 4.8.1 MySQL 11.3.2-MariaDB-1:11.3.2+maria~ubu2204 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DELIMITER ;;

DROP PROCEDURE IF EXISTS `sp_AllocateMessages`;;
CREATE PROCEDURE `sp_AllocateMessages`(IN `batch_size` int, IN `batch_time_window_in_minute` int, IN `lock_timeout_in_seconds` int, IN `caller_id` varchar(40))
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
       ROLLBACK;
       SELECT 'An error occurred. Rolling back transaction.' AS Message;
    END;

    SET AUTOCOMMIT = 0;

    START TRANSACTION;

    -- Create Simulation Logger
    CREATE TEMPORARY TABLE tmp_logger(data VARCHAR(500));

    -- TOD: LOG
    INSERT INTO tmp_logger (data) 
    VALUES(CONCAT('Caller with id: ', caller_id,' is trying to take the lock at: ', CONVERT(UNIX_TIMESTAMP(NOW()), CHAR)));
    
    SET @lockId := 'allocate-messages';

    -- Acquire a lock on the row with the specified ID
    SELECT * FROM q_lock 
    WHERE id = @lockId 
    AND (acquired_at IS NULL OR acquired_at = 0 OR DATE_SUB(NOW(), INTERVAL lock_timeout_in_seconds SECOND) > 0)  
    FOR UPDATE;

    -- TOD: LOG
    INSERT INTO tmp_logger (data) VALUES(CONCAT('Lock Acquired By: ', caller_id, ' at ', CONVERT(UNIX_TIMESTAMP(NOW()), CHAR)));
    
    -- TODO: INTENTIONAL SLEEP
    -- TOD: LOG
    INSERT INTO tmp_logger (data) 
    VALUES(CONCAT('Caller with id: ', caller_id, ' is going to sleep at: ', CONVERT(UNIX_TIMESTAMP(NOW()), CHAR)));
    DO SLEEP(2);

    
    UPDATE q_lock SET acquired_at = 1 WHERE id = @lockId;


    -- Create Temp Table
    CREATE TEMPORARY TABLE tmp_message_box(id VARCHAR(40));
 
    INSERT INTO tmp_message_box
    SELECT id FROM message_box 
    WHERE processed_at IS NULL 
    AND (acquired_at IS NULL OR DATE_ADD(NOW(), INTERVAL batch_time_window_in_minute MINUTE)) 
    ORDER BY process_by ASC LIMIT batch_size;

    -- Set Acquired
    UPDATE message_box
    SET acquired_at = NOW()
    WHERE id IN (SELECT id FROM tmp_message_box);

    -- TOD: LOG
    INSERT INTO tmp_logger (data) 
    VALUES(CONCAT('Caller with id: ', caller_id, ' has acquired messages at: ', CONVERT(UNIX_TIMESTAMP(NOW()), CHAR)));

    -- Release Lock
    UPDATE q_lock
    SET acquired_at = NULL 
    WHERE id = @lockId;

    -- Return Result
    SELECT * FROM message_box WHERE id IN (SELECT id FROM tmp_message_box);

    -- TODO: Un-Comment for debugging
    -- SELECT * from tmp_logger;
       
    COMMIT;
END;;

DROP PROCEDURE IF EXISTS `sp_CheckPoint`;;
CREATE PROCEDURE `sp_CheckPoint`(IN id VARCHAR(40))
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'An error occurred. Rolling back transaction.' AS Message;
    END;

    START TRANSACTION;



    
    COMMIT;
END;;

DROP PROCEDURE IF EXISTS `sp_EnqueueMessage`;;
CREATE PROCEDURE `sp_EnqueueMessage`(IN `id` varchar(40), IN `process_by` varchar(50), IN `processed_at` timestamp(6), IN `message` json, IN `acquired_at` timestamp(6))
BEGIN
    INSERT INTO message_box(`id`, `process_by`, `processed_at`, `message`, `acquired_at`) VALUES(id, process_by, processed_at, message, acquired_at);

    SELECT * FROM message_box WHERE `id` = id;

END;;

DROP PROCEDURE IF EXISTS `sp_GetQueueDetails`;;
CREATE PROCEDURE `sp_GetQueueDetails`(IN `processedInXMinutes` int, IN `toBeProcessedInYMinutes` int)
BEGIN
    SELECT @unprocessed := COUNT(id) FROM message_box WHERE processed_at IS NULL AND acquired_at IS NULL;

    -- Results will always be approximations as while reading, inserts are not blocked for performance reasons
    SET @currentTime = NOW();

    SELECT @processedCount := COUNT(id) FROM message_box WHERE processed_at > DATE_SUB(@currentTime, INTERVAL processedInXMinutes MINUTE);

    SELECT @toBeProcesseCount := COUNT(id) FROM message_box WHERE acquired_at IS NOT NULL AND process_by < DATE_ADD(@currentTime, INTERVAL toBeProcessedInYMinutes MINUTE);

    SELECT @currentTime as CurrentTime,
    @processedCount as Processed,
    @unprocessed as Pending, 
    @toBeProcesseCount as InComing;

END;;

DELIMITER ;

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `message_box`;
CREATE TABLE `message_box` (
  `id` varchar(40) NOT NULL,
  `process_by` timestamp NULL DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`message`)),
  `acquired_at` timestamp NULL DEFAULT NULL,
  KEY `process_by_idx` (`process_by`),
  KEY `processed_at_idx` (`processed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `q_lock`;
CREATE TABLE `q_lock` (
  `id` varchar(20) NOT NULL,
  `acquired_at` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2024-05-05 05:39:19
