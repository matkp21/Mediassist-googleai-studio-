from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from crawl4ai import AsyncWebCrawler

app = FastAPI()

class CrawlRequest(BaseModel):
    url: str

@app.post("/crawl")
async def crawl_url(request: CrawlRequest):
    try:
        async with AsyncWebCrawler(verbose=True) as crawler:
            result = await crawler.arun(
                url=request.url,
                bypass_cache=True,
                magic=True
            )
            
            if result.success:
                return {
                    "success": True, 
                    "markdown": result.markdown,
                }
            else:
                raise HTTPException(status_code=500, detail=result.error_message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
