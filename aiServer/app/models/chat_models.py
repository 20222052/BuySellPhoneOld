from dataclasses import dataclass
from typing import List, Dict, Optional

@dataclass
class ChatRequest:
    messages: List[Dict[str, str]]
    
    @classmethod
    def from_dict(cls, data: Dict):
        return cls(messages=data.get('messages', []))

@dataclass
class ChatResponse:
    response: str
    
    def to_dict(self):
        return {'response': self.response}
