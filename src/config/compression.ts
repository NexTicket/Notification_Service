/**
 * Compression configuration for KafkaJS
 * Using GZIP compression (built-in, no additional dependencies needed)
 */

import { CompressionTypes } from 'kafkajs';

// GZIP is built into KafkaJS, no registration needed
// This file exists for consistency and future compression configuration

export const KAFKA_COMPRESSION_TYPE = CompressionTypes.GZIP;

console.log('Using GZIP compression for Kafka messages');
