DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `sp_ArchiveDailyData`()
BEGIN
    IF (SELECT COUNT(*) FROM `current_data` WHERE `Timestamp` >= CURDATE() - INTERVAL 1 DAY AND `Timestamp` < CURDATE()) > 0 THEN
        
        INSERT INTO `daily_statistics` (
            `Callsign`, 
            `Date`, 
            `Beacon_Count`, 
            `Alarm_Count`, 
            `Max_Altitude`, 
            `Min_Altitude`, 
            `Average_Speed`, 
            `Max_Speed`, 
            `Average_Temp`, 
            `Min_Temp`, 
            `Max_Temp`, 
            `Total_Precipitation`
        )
        SELECT 
            `Callsign`, 
            CURDATE() - INTERVAL 1 DAY,
            COUNT(*),
            SUM(CASE WHEN `Alarm_Status` > 0 THEN 1 ELSE 0 END),
            MAX(`Altitude`), 
            MIN(`Altitude`), 
            AVG(`Speed`), 
            MAX(`Speed`),
            AVG(`Temperature`), 
            MIN(`Temperature`), 
            MAX(`Temperature`), 
            SUM(`Precipitation`)                
        FROM `current_data`
        WHERE `Timestamp` >= CURDATE() - INTERVAL 1 DAY 
          AND `Timestamp` < CURDATE()
        GROUP BY `Callsign`;

        DELETE FROM `current_data` 
        WHERE `Timestamp` < CURDATE();
        
    END IF;
END //

DELIMITER ;

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS `daily_archive_event`
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 5 MINUTE)
COMMENT 'Automatically runs the archive procedure every night'
DO
  CALL `sp_ArchiveDailyData`();