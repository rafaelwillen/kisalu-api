import dotenv from "dotenv";
import build from "./app";

dotenv.config();

const port = (process.env.PORT || 3000) as number;

async function main() {
  try {
    const app = build();
    const address = await app.listen({ port });
    console.log(`Server running on ${address}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();