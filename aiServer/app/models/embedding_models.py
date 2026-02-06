from dataclasses import dataclass
from typing import List, Dict

@dataclass
class EmbeddingRequest:
    text: str
    
    @classmethod
    def from_dict(cls, data: Dict):
        return cls(text=data.get('text', ''))

@dataclass
class EmbeddingResponse:
    embedding: List[float]
    model: str = "vietnamese-bi-encoder"
    
    def to_dict(self):
        return {
            'embedding': self.embedding,
            'model': self.model
        }
