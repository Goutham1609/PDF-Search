from sentence_transformers import SentenceTransformer
from config import EMBEDDING_MODEL, VECTOR_DIMENSION, EMBEDDING_BATCH_SIZE
import numpy as np

class EnhancedEmbeddingModel:
    def __init__(self):
        self.model = SentenceTransformer(EMBEDDING_MODEL)
        model_dim = self.model.get_sentence_embedding_dimension()
        if model_dim != VECTOR_DIMENSION:
            raise ValueError(f"Model dimension mismatch! Model: {model_dim}, Config: {VECTOR_DIMENSION}")

    def encode_with_context(self, chunks, is_query=False):
        texts = []
        for chunk in chunks:
            if is_query:
                parts = [
                    f"Company: {chunk.get('company', '')}",
                    f"Year: {chunk.get('year', '')}" if chunk.get('year') else "",
                    chunk['text']
                ]
            else:
                parts = [
                    f"Company: {chunk['company']}",
                    f"Years: {chunk['from_year']}-{chunk['to_year']}",
                    chunk['text']
                ]
            texts.append(" ".join([p for p in parts if p.strip()]))

        embeddings = self.model.encode(
            texts,
            batch_size=EMBEDDING_BATCH_SIZE,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=True
        )
        return embeddings.tolist()

    def encode(self, texts, **kwargs):
        return self.model.encode(texts, **kwargs)
