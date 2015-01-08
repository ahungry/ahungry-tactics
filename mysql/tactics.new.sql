-- MySQL dump 10.13  Distrib 5.5.30, for Linux (x86_64)
--
-- Host: localhost    Database: tactics
-- ------------------------------------------------------
-- Server version	5.5.30-log

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
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(255) NOT NULL,
  `pass` char(32) NOT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `banned` tinyint(1) NOT NULL DEFAULT '0',
  `uid` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card`
--

DROP TABLE IF EXISTS `card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `card` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `min_range` int(11) NOT NULL DEFAULT '0',
  `max_range` int(11) NOT NULL DEFAULT '1',
  `atk` int(11) NOT NULL DEFAULT '0',
  `cost` int(11) NOT NULL DEFAULT '1',
  `phy` tinyint(1) NOT NULL DEFAULT '0',
  `mag` tinyint(1) NOT NULL DEFAULT '0',
  `effect` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card`
--

LOCK TABLES `card` WRITE;
/*!40000 ALTER TABLE `card` DISABLE KEYS */;
INSERT INTO `card` VALUES (1,'melee',0,1,1,0,1,0,0),(2,'kick',0,1,3,1,1,0,0),(3,'bandage',0,1,-3,3,1,0,0),(4,'flame blast',2,5,5,5,0,1,0),(5,'ice shard',2,5,5,5,0,1,0),(6,'lightning bolt',2,5,5,5,0,1,1),(7,'mana well',0,1,0,1,0,0,2),(8,'burst of knowledge',0,1,0,3,0,0,3),(9,'blue potion',0,0,0,0,0,0,2),(10,'red potion',0,0,0,0,0,0,1),(11,'purple potion',0,0,0,0,0,0,2),(12,'headache',0,4,0,6,0,0,1),(13,'divination',0,9,0,4,0,0,3);
/*!40000 ALTER TABLE `card` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deck`
--

DROP TABLE IF EXISTS `deck`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deck` (
  `unit_id` int(11) NOT NULL,
  `cards` mediumtext,
  PRIMARY KEY (`unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deck`
--

LOCK TABLES `deck` WRITE;
/*!40000 ALTER TABLE `deck` DISABLE KEYS */;
/*!40000 ALTER TABLE `deck` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `effects`
--

DROP TABLE IF EXISTS `effects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `effects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `body` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `effects`
--

LOCK TABLES `effects` WRITE;
/*!40000 ALTER TABLE `effects` DISABLE KEYS */;
INSERT INTO `effects` VALUES (1,'Headache','A splitting headache is caused to all targets, causing them to lose 1 card randomly'),(2,'Weak Mana Regen','You gain a small amount of mana'),(3,'Enlightenment','You may redraw your current hand, drawing up to the max hand size');
/*!40000 ALTER TABLE `effects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job`
--

DROP TABLE IF EXISTS `job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `hp` int(11) DEFAULT '0',
  `mp` int(11) DEFAULT '0',
  `atk` int(11) DEFAULT '0',
  `def` int(11) DEFAULT '0',
  `mag` int(11) DEFAULT '0',
  `mdef` int(11) DEFAULT '0',
  `xp` int(11) DEFAULT '1',
  `img` varchar(255) DEFAULT NULL,
  `reqs` mediumtext,
  `speed` int(11) DEFAULT '0',
  `spoiler` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job`
--

LOCK TABLES `job` WRITE;
/*!40000 ALTER TABLE `job` DISABLE KEYS */;
INSERT INTO `job` VALUES (1,'skeleton',-1,0,1,0,0,0,1,'skeleton_sheet.png','hp:le0',0,'To become undead you must first die'),(2,'slime',0,0,0,0,0,0,10,'slime_sheet.png','job_id:eq1,hp:gt0',0,'When brought back from the dead, you are nothing more than slime'),(3,'peasant',1,0,0,1,0,0,1,'peasant_sheet.png','hp:gt0',0,'Everyone starts here'),(4,'mermaid',1,10,-3,-3,3,3,5,'mermaid_sheet.png','hp:gt0',0,'Only when you\'ve experienced being a slime can you become a magical creature'),(12,'robot',4,0,2,2,-2,0,10,'robot_sheet.png','hp:gt0',0,'A very powerful slime can crystallize into a new form'),(13,'witch',0,5,-3,-1,5,0,3,'witch_sheet.png','hp:gt0',0,'Seasoned peasants can dabble in the dark arts'),(14,'amazon',2,2,6,0,0,0,0,'amazon_sheet.png','hp:gt0',0,'Seasoned peasants can venture down the path of an amazon');
/*!40000 ALTER TABLE `job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loc`
--

DROP TABLE IF EXISTS `loc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loc` (
  `id` int(11) NOT NULL,
  `x` int(11) NOT NULL DEFAULT '0',
  `y` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loc`
--

LOCK TABLES `loc` WRITE;
/*!40000 ALTER TABLE `loc` DISABLE KEYS */;
/*!40000 ALTER TABLE `loc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `queue`
--

DROP TABLE IF EXISTS `queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `queue` (
  `id` int(11) NOT NULL,
  `actions` mediumtext,
  `eventLog` mediumtext,
  `eventDate` datetime DEFAULT NULL,
  `processed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `queue`
--

LOCK TABLES `queue` WRITE;
/*!40000 ALTER TABLE `queue` DISABLE KEYS */;
/*!40000 ALTER TABLE `queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `set_skills`
--

DROP TABLE IF EXISTS `set_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `set_skills` (
  `id` int(11) NOT NULL,
  `aid1` int(11) NOT NULL DEFAULT '1',
  `aid2` int(11) NOT NULL DEFAULT '2',
  `aid3` int(11) DEFAULT NULL,
  `aid4` int(11) DEFAULT NULL,
  `aid5` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `set_skills`
--

LOCK TABLES `set_skills` WRITE;
/*!40000 ALTER TABLE `set_skills` DISABLE KEYS */;
INSERT INTO `set_skills` VALUES (1,1,2,3,NULL,NULL),(2,1,2,3,NULL,NULL),(3,1,2,3,NULL,NULL),(4,1,2,3,NULL,NULL),(5,1,2,3,NULL,NULL),(6,1,2,3,NULL,NULL),(7,1,2,3,NULL,NULL);
/*!40000 ALTER TABLE `set_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit`
--

DROP TABLE IF EXISTS `unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `hp` int(11) DEFAULT '0',
  `mp` int(11) DEFAULT '0',
  `atk` int(11) DEFAULT '0',
  `def` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '0',
  `mag` int(11) NOT NULL DEFAULT '0',
  `mdef` int(11) NOT NULL DEFAULT '0',
  `owner` int(11) NOT NULL DEFAULT '0',
  `job_id` int(11) NOT NULL DEFAULT '1',
  `level` int(11) NOT NULL DEFAULT '1',
  `xp` int(11) NOT NULL DEFAULT '0',
  `jp` int(11) NOT NULL DEFAULT '0',
  `speed` int(11) NOT NULL DEFAULT '1',
  `x` int(11) NOT NULL DEFAULT '0',
  `y` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit`
--

LOCK TABLES `unit` WRITE;
/*!40000 ALTER TABLE `unit` DISABLE KEYS */;
/*!40000 ALTER TABLE `unit` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-03-13  1:14:46
