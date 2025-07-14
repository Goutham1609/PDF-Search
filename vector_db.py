import os
from pinecone import Pinecone, ServerlessSpec
from config import PINECONE_API_KEY, PINECONE_INDEX_NAME, VECTOR_DIMENSION, SIMILARITY_METRIC, PINECONE_CLOUD, PINECONE_REGION, UPSERT_BATCH_SIZE
import time

api_key = os.getenv("PINECONE_API_KEY")
pc = Pinecone(api_key=api_key)
if not api_key:
    raise ValueError("PINECONE_API_KEY environment variable is not set.")

class EnhancedVectorDatabase:
    def __init__(self):
        self.pc = Pinecone(api_key=api_key)
        self.index_name = PINECONE_INDEX_NAME
        self.index = self._create_or_connect_index()

    def _create_or_connect_index(self):
        existing_indexes = [index['name'] for index in self.pc.list_indexes()]
        if self.index_name in existing_indexes:
            return self.pc.Index(self.index_name)

        self.pc.create_index(
            name=self.index_name,
            dimension=VECTOR_DIMENSION,
            metric=SIMILARITY_METRIC,
            spec=ServerlessSpec(cloud=PINECONE_CLOUD, region=PINECONE_REGION)
        )
        while not self.pc.describe_index(self.index_name).status['ready']:
            time.sleep(5)
        return self.pc.Index(self.index_name)

    def upsert_with_metadata(self, chunks, embeddings):
        vectors = []
        for chunk, embedding in zip(chunks, embeddings):
            vector_data = (
                chunk['chunk_id'],
                embedding,
                {
                    'text': chunk['text'],
                    'company': chunk['company'],
                    'from_year': chunk['from_year'],
                    'to_year': chunk['to_year'],
                    'filename': chunk['filename'],
                    'chunk_index': chunk['chunk_index'],
                    'total_chunks': chunk['total_chunks']
                }
            )
            vectors.append(vector_data)

        for i in range(0, len(vectors), UPSERT_BATCH_SIZE):
            batch = vectors[i:i + UPSERT_BATCH_SIZE]
            self.index.upsert(vectors=batch)
