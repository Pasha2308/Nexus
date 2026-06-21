import { Redis } from 'ioredis';
const redis = new Redis("rediss://default:gQAAAAAAAZCaAAIgcDFjODVhNTQzZGJjNDI0NjczOTU0YTFmZGE4OWYzZWFkMw@central-manatee-102554.upstash.io:6379");
async function run() {
  await redis.set("test_key", "Nexus Valkey is Working!");
  const val = await redis.get("test_key");
  console.log("Redis response:", val);
  process.exit(0);
}
run();
