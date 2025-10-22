/**
 * This file MUST be imported before any Kafka initialization
 * It registers the Snappy compression codec with KafkaJS
 */

// We need to use CommonJS require since CompressionCodecs is not exported in ES modules
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import compression from KafkaJS using CommonJS
const { CompressionTypes, CompressionCodecs } = require('kafkajs');

// Load the Snappy codec using require
const SnappyCodec = require('kafkajs-snappy');

// Register Snappy compression codec with KafkaJS
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

console.log('Snappy compression codec registered');
