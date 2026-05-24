
import asyncio

async def run_parallel_analysis(tasks):

    results = await asyncio.gather(*tasks)

    return results
