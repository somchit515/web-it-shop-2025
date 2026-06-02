// migrate.js — copy local MongoDB → Atlas
// Run: node migrate.js

import mongoose from "mongoose";

const LOCAL_URI = "mongodb://127.0.0.1:27017/web-it-shop";
// Direct URI (no SRV) — avoids querySrv ECONNREFUSED on Windows
const ATLAS_URI = "mongodb://amphavongs_db_user:Ithubb2025@ac-drta4xr-shard-00-00.hkmqzuo.mongodb.net:27017,ac-drta4xr-shard-00-01.hkmqzuo.mongodb.net:27017,ac-drta4xr-shard-00-02.hkmqzuo.mongodb.net:27017/ithubb?authSource=admin&replicaSet=atlas-n995oo-shard-0&tls=true&retryWrites=true&w=majority";

const COLLECTIONS = [
  "users",
  "products",
  "orders",
  "categories",
  "blogs",
  "coupons",
  "flashdeals",
  "financialtransactions",
  "pushsubscriptions",
];

async function migrate() {
  console.log("🔌 Connecting to local MongoDB...");
  const local = await mongoose.createConnection(LOCAL_URI).asPromise();

  console.log("🔌 Connecting to Atlas...");
  const atlas = await mongoose.createConnection(ATLAS_URI).asPromise();

  for (const name of COLLECTIONS) {
    try {
      const docs = await local.collection(name).find({}).toArray();
      if (docs.length === 0) {
        console.log(`⏭  ${name}: empty, skip`);
        continue;
      }
      await atlas.collection(name).deleteMany({});
      await atlas.collection(name).insertMany(docs);
      console.log(`✅ ${name}: ${docs.length} docs migrated`);
    } catch (err) {
      console.error(`❌ ${name}: ${err.message}`);
    }
  }

  await local.close();
  await atlas.close();
  console.log("\n🎉 Migration complete!");
}

migrate().catch(console.error);
