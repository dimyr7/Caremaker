-- MySQL dump 10.13  Distrib 5.6.19, for osx10.7 (i386)
--
-- Host: localhost    Database: caretaker_dev
-- ------------------------------------------------------
-- Server version	5.6.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `caretaker`
--

DROP TABLE IF EXISTS `caretaker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `caretaker` (
  `caretaker_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `town` varchar(45) NOT NULL,
  `state` varchar(2) NOT NULL,
  `zip` int(11) NOT NULL,
  `x_coord` float NOT NULL,
  `y_coord` float NOT NULL,
  `radius` int(11) NOT NULL,
  `language` varchar(15) NOT NULL,
  `experience` varchar(15) NOT NULL,
  `gender` varchar(10) NOT NULL,
  `google_id` varchar(30) NOT NULL,
  `email` varchar(45) NOT NULL,
  `can_cook` tinyint(1) DEFAULT '0',
  `can_clean` tinyint(1) DEFAULT '0',
  `can_drive` tinyint(1) DEFAULT '0',
  `skills_explanation` text,
  `bio` text,
  `price_range` varchar(45) NOT NULL,
  `pets_allowed` tinyint(1) NOT NULL DEFAULT '0',
  `origins` varchar(15) DEFAULT NULL,
  `pic_url` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`caretaker_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer` (
  `customer_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `age` int(11) NOT NULL,
  `town` varchar(15) NOT NULL,
  `state` varchar(2) NOT NULL,
  `zip` int(11) NOT NULL,
  `x_coord` float NOT NULL,
  `y_coord` float NOT NULL,
  `language` varchar(45) NOT NULL,
  `location_id` int(11) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `profile_pic` varchar(45) DEFAULT NULL,
  `email` varchar(45) NOT NULL,
  `google_id` varchar(30) NOT NULL,
  PRIMARY KEY (`customer_id`),
  KEY `fk_customer_location1_idx` (`location_id`),
  CONSTRAINT `fk_customer_location1` FOREIGN KEY (`location_id`) REFERENCES `mydb`.`location` (`location_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-09-13  1:45:34
