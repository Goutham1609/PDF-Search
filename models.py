from pydantic import BaseModel
from typing import Optional

class SearchRequest(BaseModel):
    query: str
    company: Optional[str] = None
    year: Optional[str] = None
    top_k: Optional[int] = 5
