from abc import ABC, abstractmethod

from app.ai.explainer import ExplanationGenerator
from app.ai.extractor import RequirementExtractor
from app.config import get_settings
from app.retrieval.ranking import rank_records


class LLMProvider(ABC):
    @abstractmethod
    def extract_requirement(self, text: str) -> dict:
        raise NotImplementedError

    @abstractmethod
    def rank_standards(self, requirement: dict, standards: list[dict]) -> list[dict]:
        raise NotImplementedError

    @abstractmethod
    def explain_standard(self, requirement: dict, standard: dict) -> str:
        raise NotImplementedError


class DemoProvider(LLMProvider):
    def __init__(self):
        self.extractor = RequirementExtractor()
        self.explainer = ExplanationGenerator()

    def extract_requirement(self, text: str) -> dict:
        return self.extractor.extract(text)

    def rank_standards(self, requirement: dict, standards: list[dict]) -> list[dict]:
        return rank_records(requirement, standards)

    def explain_standard(self, requirement: dict, standard: dict) -> str:
        return self.explainer.explain(requirement, standard)


class OpenAIProvider(DemoProvider):
    """Use OpenAI only for prose; standard metadata remains database-owned."""

    def __init__(self):
        super().__init__()
        self.client = None
        settings = get_settings()
        if settings.openai_api_key:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=settings.openai_api_key)
            except Exception:
                self.client = None

    def explain_standard(self, requirement: dict, standard: dict) -> str:
        deterministic = super().explain_standard(requirement, standard)
        if not self.client:
            return deterministic
        prompt = (
            "Write one concise procurement explanation using only the supplied requirement and standard record. "
            "Do not add or invent any standard number, title, version, certification, or technical fact.\n"
            f"Requirement: {requirement}\nStandard record: {standard}"
        )
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
                max_tokens=180,
            )
            content = response.choices[0].message.content
            return content.strip() if content else deterministic
        except Exception:
            return deterministic


def get_provider() -> LLMProvider:
    return OpenAIProvider() if get_settings().openai_api_key else DemoProvider()


AIProvider = DemoProvider
