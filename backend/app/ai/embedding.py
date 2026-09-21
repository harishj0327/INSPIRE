class EmbeddingProvider:
    def embed_text(self, text: str):
        tokens = text.lower().split()
        return {"tokens": tokens, "dimension": 64}
