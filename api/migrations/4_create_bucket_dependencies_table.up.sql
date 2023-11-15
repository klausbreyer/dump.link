CREATE TABLE `BucketDependencies` (
            `bucket_id` VARCHAR(11) NOT NULL,
            `depends_on_bucket_id` VARCHAR(11) NOT NULL,
            FOREIGN KEY (`bucket_id`) REFERENCES `Bucket` (`id`),
            FOREIGN KEY (`depends_on_bucket_id`) REFERENCES `Bucket` (`id`)
        );