-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 25, 2026 at 07:21 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nextjs_plantify`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Indoor Plants', 'Plants that thrive indoors with low light', '2026-04-24 08:45:24', '2026-04-24 08:45:24'),
(2, 'Outdoor Plants', 'Plants suitable for gardens and outdoor spaces', '2026-04-24 08:45:24', '2026-04-24 08:45:24'),
(3, 'Succulents', 'Drought-resistant plants with thick leaves', '2026-04-24 08:45:24', '2026-04-24 08:45:24'),
(4, 'Flowering Plants', 'Plants that produce beautiful flowers', '2026-04-24 08:45:24', '2026-04-24 08:45:24'),
(5, 'Herbs', 'Culinary and medicinal herbs', '2026-04-24 08:45:24', '2026-04-24 08:45:24'),
(6, 'Trees', 'Large woody plants and trees', '2026-04-24 08:45:24', '2026-04-24 08:45:24'),
(8, '111', 'eryrur6u', '2026-05-06 12:34:07', '2026-05-06 12:34:07'),
(9, 'AAAB', 'sddtddry', '2026-05-21 00:36:16', '2026-05-21 00:36:28');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inbox_messages`
--

CREATE TABLE `inbox_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `refund_code` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inbox_messages`
--

INSERT INTO `inbox_messages` (`id`, `user_id`, `order_id`, `title`, `message`, `refund_amount`, `refund_code`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 9, 33, 'Order #33 Cancelled & Refunded', 'Your order #33 has been cancelled successfully. A refund has been initiated to your original payment method (sslcommerz). Use the refund code below for any queries or to check status with support.', 78.00, 'REF-5B8871F6', 0, '2026-05-21 12:29:14', '2026-05-21 12:29:14');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_04_24_084932_add_phone_to_users_table', 1),
(5, '2026_04_24_093411_create_plants_table', 2),
(6, '2026_04_24_103646_add_role_to_users_table', 3),
(7, '2026_04_24_103733_add_description_and_care_tips_to_plants_table', 3),
(8, '2026_04_24_115905_create_orders_table', 4),
(9, '2026_04_24_120012_create_order_items_table', 4),
(10, '2026_04_24_130000_add_address_to_users_table', 5),
(11, '2026_04_24_150000_create_categories_table', 6),
(12, '2026_04_25_000000_add_status_to_orders_table', 7),
(13, '2026_04_25_010000_add_status_to_plants_table', 8),
(14, '2026_05_04_081708_add_payment_fields_to_orders_table', 9),
(15, '2026_05_15_000000_add_sslcommerz_fields_to_orders_table', 10),
(17, '2026_05_21_175950_create_inbox_messages_table', 11);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) NOT NULL DEFAULT 'pending',
  `billing_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`billing_address`)),
  `plant_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`plant_ids`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_price`, `status`, `payment_method`, `transaction_id`, `payment_status`, `billing_address`, `plant_ids`, `created_at`, `updated_at`) VALUES
(5, 9, 222.00, 'pending', NULL, NULL, 'pending', NULL, '\"[13]\"', '2026-04-24 06:44:32', '2026-04-24 06:44:32'),
(6, 9, 15.99, 'pending', NULL, NULL, 'pending', NULL, '\"[1]\"', '2026-04-24 07:14:33', '2026-04-24 07:14:33'),
(7, 9, 777.00, 'pending', NULL, NULL, 'pending', NULL, '\"[13]\"', '2026-04-24 09:01:22', '2026-04-24 09:01:22'),
(8, 9, 79.95, 'pending', NULL, NULL, 'pending', NULL, '\"[1]\"', '2026-04-24 09:03:03', '2026-04-24 09:03:03'),
(9, 9, 666.00, 'pending', NULL, NULL, 'pending', NULL, '\"[13]\"', '2026-04-24 09:03:28', '2026-04-24 09:03:28'),
(10, 9, 285.96, 'pending', NULL, NULL, 'pending', NULL, '\"[1,13,14]\"', '2026-04-24 09:06:49', '2026-04-24 09:06:49'),
(11, 9, 61.98, 'pending', NULL, NULL, 'pending', NULL, '\"[6,1]\"', '2026-04-24 09:36:44', '2026-04-24 09:36:44'),
(12, 10, 111.93, 'pending', NULL, NULL, 'pending', NULL, '\"[1,2,3,4,5]\"', '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(13, 11, 79.97, 'pending', NULL, NULL, 'pending', NULL, '\"[1,2,6]\"', '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(14, 12, 66.97, 'pending', NULL, NULL, 'pending', NULL, '\"[2,3,4]\"', '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(15, 13, 67.96, 'pending', NULL, NULL, 'pending', NULL, '\"[1,5,6]\"', '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(16, 9, 11.00, 'delivered', NULL, NULL, 'pending', NULL, '\"[27]\"', '2026-04-24 23:09:14', '2026-04-25 01:14:37'),
(17, 9, 11.00, 'pending', NULL, NULL, 'pending', NULL, '\"[27]\"', '2026-04-27 02:16:58', '2026-04-27 02:16:58'),
(18, 9, 119.00, 'pending', 'bkash', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"1111111\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"3r23r32\\\",\\\"zip\\\":\\\"eqfewfew\\\"}\"', '\"[1,6]\"', '2026-05-04 02:21:39', '2026-05-04 02:21:39'),
(19, 9, 119.00, 'pending', 'bkash', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"1111111\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"3r23r32\\\",\\\"zip\\\":\\\"eqfewfew\\\"}\"', '\"[1,6]\"', '2026-05-04 02:21:55', '2026-05-04 02:21:55'),
(20, 9, 119.00, 'processing', 'bkash', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"1111111\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"3r23r32\\\",\\\"zip\\\":\\\"eqfewfew\\\"}\"', '\"[1,6]\"', '2026-05-04 02:32:08', '2026-05-06 22:22:12'),
(21, 9, 119.00, 'pending', 'card', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"1111111\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"rewer\\\",\\\"zip\\\":\\\"345345\\\"}\"', '\"[1,6]\"', '2026-05-04 02:46:03', '2026-05-04 02:46:03'),
(22, 9, 24.00, 'pending', 'bkash', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"1111111\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"gerg\\\",\\\"zip\\\":\\\"34534\\\"}\"', '\"[1]\"', '2026-05-04 02:47:14', '2026-05-04 02:47:14'),
(23, 9, 44.00, 'pending', 'bkash', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"1111111\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"ewer\\\",\\\"zip\\\":\\\"23423\\\"}\"', '\"[1,4]\"', '2026-05-04 02:50:02', '2026-05-04 02:50:02'),
(24, 9, 122.00, 'pending', 'bkash', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"1111111\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"ewrwe\\\",\\\"zip\\\":\\\"234234\\\"}\"', '\"[1,40,6,5,2]\"', '2026-05-04 03:24:36', '2026-05-04 03:24:36'),
(25, 9, 161.00, 'delivered', 'card', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"ertrtertergegrr\\\",\\\"zip\\\":\\\"345643646\\\"}\"', '\"[6]\"', '2026-05-06 11:57:59', '2026-05-06 22:22:30'),
(26, 9, 113.00, 'pending', 'bkash', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"sfgdg\\\",\\\"zip\\\":\\\"3535\\\"}\"', '\"[1]\"', '2026-05-11 05:09:32', '2026-05-11 05:09:32'),
(27, 9, 131.00, 'pending', 'bkash', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"ewrwerewr\\\",\\\"zip\\\":\\\"324545\\\"}\"', '\"[5]\"', '2026-05-11 05:28:44', '2026-05-11 05:28:44'),
(28, 9, 233.00, 'processing', 'bkash', NULL, 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"zsfszf\\\",\\\"zip\\\":\\\"43453\\\"}\"', '\"[5,3]\"', '2026-05-13 00:23:58', '2026-05-13 00:25:29'),
(29, 9, 109.00, 'payment_failed', 'sslcommerz', 'PLANTIFY_6a06fb61b7c83_1778842465', 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"rtrtt\\\",\\\"zip\\\":\\\"4534535\\\"}\"', '\"[5,1]\"', '2026-05-15 04:54:25', '2026-05-15 04:55:18'),
(30, 9, 109.00, 'payment_failed', 'sslcommerz', 'PLANTIFY_6a06fbaf9b9db_1778842543', 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"trertert\\\",\\\"zip\\\":\\\"435345\\\"}\"', '\"[5,1]\"', '2026-05-15 04:55:43', '2026-05-15 04:56:31'),
(31, 9, 109.00, 'processing', 'sslcommerz', 'PLANTIFY_6a06fddf115c3_1778843103', 'paid', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"dffsdf\\\",\\\"zip\\\":\\\"3242\\\"}\"', '\"[5,1]\"', '2026-05-15 05:05:03', '2026-05-15 05:05:57'),
(32, 9, 114.00, 'pending', 'sslcommerz', 'PLANTIFY_6a070188116b8_1778844040', 'paid', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"adafs\\\",\\\"zip\\\":\\\"2344\\\"}\"', '\"[5,3]\"', '2026-05-15 05:20:40', '2026-05-15 05:21:19'),
(33, 9, 78.00, 'cancelled', 'sslcommerz', 'PLANTIFY_6a0701cd9c378_1778844109', 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"wrwewe\\\",\\\"zip\\\":\\\"35454\\\"}\"', '\"[1]\"', '2026-05-15 05:21:49', '2026-05-21 12:29:14'),
(34, 9, 100.00, 'cancelled', 'sslcommerz', 'PLANTIFY_6a0e8c488a5ed_1779338312', 'pending', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"wwww\\\",\\\"zip\\\":\\\"222\\\"}\"', '\"[3]\"', '2026-05-20 22:38:32', '2026-05-21 12:20:08'),
(35, 9, 174.00, 'delivered', 'sslcommerz', 'PLANTIFY_6a0ea72e27ed1_1779345198', 'paid', '\"{\\\"name\\\":\\\"Alex\\\",\\\"email\\\":\\\"A@gmail.com\\\",\\\"phone\\\":\\\"11111112\\\",\\\"address\\\":\\\"123 Main Street, City\\\",\\\"city\\\":\\\"Adasdsrf\\\",\\\"zip\\\":\\\"2324\\\"}\"', '\"[5,3,4]\"', '2026-05-21 00:33:18', '2026-05-21 00:40:59');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `plant_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `plant_id`, `quantity`, `price`, `created_at`, `updated_at`) VALUES
(4, 6, 1, 1, 15.99, '2026-04-24 07:14:33', '2026-04-24 07:14:33'),
(6, 8, 1, 5, 15.99, '2026-04-24 09:03:03', '2026-04-24 09:03:03'),
(8, 10, 1, 2, 15.99, '2026-04-24 09:06:49', '2026-04-24 09:06:49'),
(11, 11, 6, 1, 45.99, '2026-04-24 09:36:44', '2026-04-24 09:36:44'),
(12, 11, 1, 1, 15.99, '2026-04-24 09:36:44', '2026-04-24 09:36:44'),
(13, 12, 1, 3, 15.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(14, 12, 2, 2, 24.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(15, 12, 3, 1, 35.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(16, 12, 4, 1, 18.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(17, 12, 5, 1, 12.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(18, 13, 1, 2, 15.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(19, 13, 2, 1, 24.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(20, 13, 6, 1, 45.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(21, 14, 2, 1, 24.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(22, 14, 3, 1, 35.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(23, 14, 4, 1, 18.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(24, 15, 1, 2, 15.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(25, 15, 5, 2, 12.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(26, 15, 6, 1, 45.99, '2026-04-24 10:02:06', '2026-04-24 10:02:06'),
(29, 18, 1, 1, 15.99, '2026-05-04 02:21:39', '2026-05-04 02:21:39'),
(30, 18, 6, 2, 45.99, '2026-05-04 02:21:39', '2026-05-04 02:21:39'),
(31, 19, 1, 1, 15.99, '2026-05-04 02:21:55', '2026-05-04 02:21:55'),
(32, 19, 6, 2, 45.99, '2026-05-04 02:21:55', '2026-05-04 02:21:55'),
(33, 20, 1, 1, 15.99, '2026-05-04 02:32:08', '2026-05-04 02:32:08'),
(34, 20, 6, 2, 45.99, '2026-05-04 02:32:08', '2026-05-04 02:32:08'),
(35, 21, 1, 1, 15.99, '2026-05-04 02:46:03', '2026-05-04 02:46:03'),
(36, 21, 6, 2, 45.99, '2026-05-04 02:46:03', '2026-05-04 02:46:03'),
(37, 22, 1, 1, 15.99, '2026-05-04 02:47:14', '2026-05-04 02:47:14'),
(38, 23, 1, 1, 15.99, '2026-05-04 02:50:02', '2026-05-04 02:50:02'),
(39, 23, 4, 1, 18.99, '2026-05-04 02:50:02', '2026-05-04 02:50:02'),
(40, 24, 1, 1, 15.99, '2026-05-04 03:24:36', '2026-05-04 03:24:36'),
(42, 24, 6, 1, 45.99, '2026-05-04 03:24:36', '2026-05-04 03:24:36'),
(43, 24, 5, 1, 12.99, '2026-05-04 03:24:36', '2026-05-04 03:24:36'),
(44, 24, 2, 1, 24.99, '2026-05-04 03:24:36', '2026-05-04 03:24:36'),
(45, 25, 6, 2, 45.99, '2026-05-06 11:57:59', '2026-05-06 11:57:59'),
(46, 26, 1, 3, 15.99, '2026-05-11 05:09:32', '2026-05-11 05:09:32'),
(47, 27, 5, 5, 12.99, '2026-05-11 05:28:44', '2026-05-11 05:28:44'),
(48, 28, 5, 1, 12.99, '2026-05-13 00:23:58', '2026-05-13 00:23:58'),
(49, 28, 3, 4, 35.99, '2026-05-13 00:23:58', '2026-05-13 00:23:58'),
(50, 29, 5, 1, 12.99, '2026-05-15 04:54:25', '2026-05-15 04:54:25'),
(51, 29, 1, 2, 15.99, '2026-05-15 04:54:25', '2026-05-15 04:54:25'),
(52, 30, 5, 1, 12.99, '2026-05-15 04:55:43', '2026-05-15 04:55:43'),
(53, 30, 1, 2, 15.99, '2026-05-15 04:55:43', '2026-05-15 04:55:43'),
(54, 31, 5, 1, 12.99, '2026-05-15 05:05:03', '2026-05-15 05:05:03'),
(55, 31, 1, 2, 15.99, '2026-05-15 05:05:03', '2026-05-15 05:05:03'),
(56, 32, 5, 1, 12.99, '2026-05-15 05:20:40', '2026-05-15 05:20:40'),
(57, 32, 3, 1, 35.99, '2026-05-15 05:20:40', '2026-05-15 05:20:40'),
(58, 33, 1, 1, 15.99, '2026-05-15 05:21:49', '2026-05-15 05:21:49'),
(59, 34, 3, 1, 35.99, '2026-05-20 22:38:32', '2026-05-20 22:38:32'),
(60, 35, 5, 1, 12.99, '2026-05-21 00:33:18', '2026-05-21 00:33:18'),
(61, 35, 3, 2, 35.99, '2026-05-21 00:33:18', '2026-05-21 00:33:18'),
(62, 35, 4, 1, 18.99, '2026-05-21 00:33:18', '2026-05-21 00:33:18');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plants`
--

CREATE TABLE `plants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `scientific_name` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `specialist_id` bigint(20) UNSIGNED DEFAULT NULL,
  `price` decimal(8,2) NOT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'available',
  `average_rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `reviews_count` int(11) NOT NULL DEFAULT 0,
  `sold` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `description` text DEFAULT NULL,
  `care_tips` text DEFAULT NULL,
  `images` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `plants`
--

INSERT INTO `plants` (`id`, `name`, `scientific_name`, `category`, `specialist_id`, `price`, `thumbnail`, `stock`, `status`, `average_rating`, `reviews_count`, `sold`, `created_at`, `updated_at`, `description`, `care_tips`, `images`) VALUES
(1, 'Aloe Vera', 'Aloe barbadensis', 'Succulent', 7, 15.99, '/storage/uploads/hDyrBqvd9cmkGImToEANt9ZfQ78FmZOlXX7pyc3b.jpg', 408, 'available', 4.50, 120, 29, '2026-04-24 03:37:18', '2026-05-21 12:29:14', 'Aloe Vera is a succulent plant species of the genus Aloe. It grows abundantly in tropical climates and has been widely used in herbal medicine.', 'Water deeply but infrequently. Allow soil to dry out between waterings. Bright, indirect sunlight. Well-draining soil is essential.', '[]'),
(2, 'Snake Plant', 'Sansevieria trifasciata', 'Air Purifying', 7, 24.99, '/storage/uploads/KXCTixcSHjqtYiBlVwfRvhQLkpMU3CA39cAXOETT.jpg', 28, 'available', 4.80, 85, 6, '2026-04-24 03:37:18', '2026-05-11 19:17:57', 'The Snake Plant, also known as Mother-in-Law\'s Tongue, is a hardy plant that can survive in low light and with little water.', 'Very low maintenance. Water only when soil is completely dry. Tolerates low light but prefers indirect light. Avoid overwatering.', '[]'),
(3, 'Monstera Deliciosa', 'Monstera deliciosa', 'Tropical', 7, 35.99, '/storage/uploads/YkjKsi7Z38oLh5WofdI874u3vZ9TIR20fGkzqGN3.jpg', 12, 'available', 4.60, 95, 10, '2026-04-24 03:37:18', '2026-05-21 12:20:08', 'Monstera deliciosa, also known as the Swiss Cheese Plant, is famous for its large, glossy leaves with natural holes.', 'Bright, indirect light. Water when top inch of soil is dry. Loves humidity - mist leaves regularly. Support with a moss pole.', '[\"\\/storage\\/uploads\\/2jsNhTREWkqmh7kAKnTd27xf8DlrkNDeyxAUcUmE.jpg\",\"\\/storage\\/uploads\\/X6TqOyx7OBbraAxQTEU6519t9Xm9MSqssYfG1ujP.jpg\"]'),
(4, 'Peace Lily', 'Spathiphyllum', 'Air Purifying', 7, 18.99, '/storage/uploads/p8DY7IvbDO0rUrInOHjVAjTzhp1MWNqP9vUgbvcW.jpg', 38, 'available', 4.30, 70, 4, '2026-04-24 03:37:18', '2026-05-21 00:33:18', 'Peace Lily is a popular houseplant that produces beautiful white flowers and is excellent at filtering indoor air pollutants.', 'Keep soil consistently moist but not soggy. Low to medium light. Wipe leaves to keep them dust-free. Yellow leaves indicate overwatering.', '[]'),
(5, 'Jade Plant', 'Crassula ovata', 'Succulent', 7, 12.99, '/storage/uploads/99Bcy7jjxWKxN1z9X6e85hZmC2Gs6XBlsgDBdvDM.jpg', 50, 'available', 4.70, 110, 13, '2026-04-24 03:37:18', '2026-05-21 00:33:18', 'Jade Plant is a popular succulent houseplant with thick, woody stems and oval-shaped leaves. It\'s considered a symbol of good luck.', 'Water thoroughly, then allow soil to dry out before watering again. Bright light to full sun. Protect from frost. Prune to maintain shape.', '[]'),
(6, 'Fiddle Leaf Fig', 'Ficus lyrata', 'Tropical', 7, 45.99, '/storage/uploads/y0YEfHBvEvpDRTAPHMIyW5TXXH3KUUHOQYJ0Hp3z.jpg', 0, 'available', 4.40, 60, 17, '2026-04-24 03:37:18', '2026-05-11 19:14:01', 'Fiddle Leaf Fig is a trendy houseplant known for its large, violin-shaped leaves and can grow into a tall tree-like plant indoors.', 'Bright, indirect light is ideal. Water when top 2-3 inches of soil are dry. Rotate plant regularly for even growth. Keep away from drafts.', '[]'),
(42, 'AAAA', 'sesetr', 'AAAB', 7, 3223.00, '/storage/uploads/Rs7QvIP8xRs6a02R6ImWxGqsNkzUrRgNmaJej9aU.jpg', 11, 'available', 0.00, 0, 0, '2026-05-21 00:37:51', '2026-05-21 00:37:51', 'aewrwresrt', 'zdsetestest', '[\"\\/storage\\/uploads\\/TsILidFLAZwj9wN1sHhdw7rwSbBL1oCc8yaQ8iRt.jpg\",\"\\/storage\\/uploads\\/v9ftJXfVO3PF4Ii0DoalOh3pf1XRyuk2P7aqUwPr.jpg\",\"\\/storage\\/uploads\\/4FCooyEcbvclZiuYqZ0pmqhn0IsO3Gvlo1Grcavy.jpg\",\"\\/storage\\/uploads\\/LAATeYIqTVauIBudDaKO6eE1rykFJiUbryOGBS3P.jpg\"]');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `plant_id` bigint(20) UNSIGNED NOT NULL,
  `specialist_id` bigint(20) UNSIGNED DEFAULT NULL,
  `question` text NOT NULL,
  `answer` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `customer_id`, `plant_id`, `specialist_id`, `question`, `answer`, `created_at`, `updated_at`) VALUES
(1, 9, 27, 7, 'aa', NULL, '2026-04-25 01:07:14', '2026-04-25 01:07:14'),
(2, 9, 42, 7, 'hi', NULL, '2026-05-21 11:18:30', '2026-05-21 11:18:30'),
(3, 9, 5, 7, 'afgregerg', 'yoyoyo', '2026-05-21 11:43:54', '2026-05-21 11:44:24');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `plant_id` bigint(20) UNSIGNED NOT NULL,
  `stars` int(11) NOT NULL DEFAULT 5,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `plant_id`, `stars`, `comment`, `created_at`, `updated_at`) VALUES
(1, 9, 1, 4, 'Great quality, fast delivery.', '2026-04-24 09:10:56', '2026-04-24 09:26:28'),
(2, 9, 1, 4, 'Great quality, fast delivery.', '2026-04-24 09:10:56', '2026-04-24 09:10:56'),
(4, 9, 13, 5, 'hi', '2026-04-24 09:19:46', '2026-04-24 09:22:32'),
(5, 9, 2, 4, 'Arrived in great condition. Very easy care.', '2026-04-24 09:26:28', '2026-04-24 09:26:28'),
(6, 9, 3, 5, 'Love this plant! The fenestrations are beautiful.', '2026-04-24 09:26:28', '2026-04-24 09:26:28'),
(7, 9, 4, 4, 'Lovely plant, blooms often.', '2026-04-24 09:26:28', '2026-04-24 09:26:28'),
(8, 9, 5, 5, 'Slow growing but healthy. Great investment.', '2026-04-24 09:26:28', '2026-04-24 09:26:28'),
(9, 9, 6, 4, 'Requires some care but worth it.', '2026-04-24 09:26:28', '2026-04-24 09:26:28'),
(10, 10, 1, 5, 'Great plant! Loved it.', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(11, 10, 2, 4, 'Very easy to care for.', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(12, 10, 3, 5, 'Beautiful leaves!', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(13, 11, 1, 5, 'Excellent quality!', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(14, 11, 2, 4, 'Arrived in great condition.', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(15, 11, 6, 5, 'Love my fiddle leaf fig!', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(16, 12, 2, 5, 'Perfect for my office.', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(17, 12, 3, 4, 'Growing well.', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(18, 12, 4, 5, 'Beautiful blooms!', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(19, 13, 1, 5, 'Healthy plant, fast delivery!', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(20, 13, 5, 5, 'Bringing good luck to my home.', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(21, 13, 6, 4, 'Statement piece!', '2026-04-24 10:02:14', '2026-04-24 10:02:14'),
(23, 9, 27, 4, 'bye', '2026-04-25 01:16:43', '2026-04-25 01:16:43');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'customer'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `address`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `role`) VALUES
(6, 'Test User', 'test@example.com', NULL, NULL, '2026-04-24 06:23:15', '$2y$12$zRTO9DE8V8L46k7eec1jm.bDRxPl6kvrlMDHCZQGK631cSUqddm3a', 'xpymtXFWjU', '2026-04-24 06:23:15', '2026-04-24 06:23:15', 'customer'),
(7, 'Plant Specialist', 'P@gmail.com', '1234567890', NULL, NULL, '$2y$12$wRBCloo5JFC9zcx0u5fEi.52CaI2WWWXg65s74N4bc74hW1l2ANGW', NULL, '2026-04-24 06:23:16', '2026-04-24 06:23:16', 'specialist'),
(8, 'Test User', 'test@test.com', '1234567890', NULL, NULL, '$2y$12$uOuX0YFBZZrUfBpbbBIi9.oa2edJ/4Fltu00u5R89arLItuIRfkSm', NULL, '2026-04-24 06:42:11', '2026-04-24 06:42:11', 'customer'),
(9, 'Alex', 'A@gmail.com', '11111112', '123 Main Street, City', NULL, '$2y$12$ySuU3fTu1MhTRx6pKHpbQuw5PuQMAS2mdoQJZZZFD46/U9SC2i2Eq', NULL, '2026-04-24 06:43:55', '2026-05-06 10:21:28', 'customer'),
(10, 'C', 'C@gmail.com', '1111111111', NULL, NULL, '$2y$12$XBOGPPYTTVhNewedp4fjMOt1EYO.wjDpa245AlWbNKxHf7UX.oUGW', NULL, '2026-04-24 10:01:25', '2026-04-24 10:01:56', 'customer'),
(11, 'C1', 'C1@gmail.com', '1111111111', NULL, NULL, '$2y$12$XBOGPPYTTVhNewedp4fjMOt1EYO.wjDpa245AlWbNKxHf7UX.oUGW', NULL, '2026-04-24 10:01:25', '2026-04-24 10:01:56', 'customer'),
(12, 'C2', 'C2@gmail.com', '1111111111', NULL, NULL, '$2y$12$XBOGPPYTTVhNewedp4fjMOt1EYO.wjDpa245AlWbNKxHf7UX.oUGW', NULL, '2026-04-24 10:01:26', '2026-04-24 10:01:56', 'customer'),
(13, 'C3', 'C3@gmail.com', '1111111111', NULL, NULL, '$2y$12$XBOGPPYTTVhNewedp4fjMOt1EYO.wjDpa245AlWbNKxHf7UX.oUGW', NULL, '2026-04-24 10:01:26', '2026-04-24 10:01:56', 'customer'),
(16, 'Delivery User', 'delivery@example.com', '1234567890', NULL, NULL, '$2y$12$XbVAkQjzSt9k4XsEEOz6Gus71fIIP5PZfLLrBkUMg1oZBlAAZ9GgC', NULL, '2026-04-24 23:55:33', '2026-04-24 23:55:33', 'delivery'),
(17, 'Delivery User', 'D@gmail.com', '1234567890', NULL, NULL, '$2y$12$OhSO0DfGkh7XaewvRVOy5uRI/jqCtGwZYC7vDqUAUOgO6mJ5oL2yu', NULL, '2026-04-24 23:58:58', '2026-04-24 23:58:58', 'delivery'),
(19, 'Admin User', 'AA@gmail.com', '9876543210', NULL, NULL, '$2y$12$liUIA7M08oh5HRqwd1dEP.ZByUk4iQQbyDaKZWZPnA4N1dDbTqI8e', NULL, '2026-04-25 01:29:25', '2026-04-25 01:29:25', 'admin'),
(20, 'C5', 'C5@gmail.com', 'r3434t34t', 'dddd', NULL, '$2y$12$.hkqFWdZqCdDttGHy7U1uupku.SOBFcF3nQSaTM8RCoRkcMJoHRSq', NULL, '2026-04-25 02:12:23', '2026-04-25 03:00:55', 'customer');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `plant_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `user_id`, `plant_id`, `created_at`, `updated_at`) VALUES
(14, 9, 1, '2026-05-06 06:31:11', '2026-05-06 06:31:11'),
(15, 9, 6, '2026-05-06 06:31:13', '2026-05-06 06:31:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_name_unique` (`name`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `inbox_messages`
--
ALTER TABLE `inbox_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inbox_messages_user_id_foreign` (`user_id`),
  ADD KEY `inbox_messages_order_id_foreign` (`order_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_user_id_foreign` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_plant_id_foreign` (`plant_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `plants`
--
ALTER TABLE `plants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wishlists_user_id_plant_id_unique` (`user_id`,`plant_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inbox_messages`
--
ALTER TABLE `inbox_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `plants`
--
ALTER TABLE `plants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inbox_messages`
--
ALTER TABLE `inbox_messages`
  ADD CONSTRAINT `inbox_messages_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inbox_messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_plant_id_foreign` FOREIGN KEY (`plant_id`) REFERENCES `plants` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
