class DemoRanker:
    def score(self, requirement: dict, standard: dict) -> float:
        matches = 0
        text = " ".join([requirement.get("product", ""), requirement.get("application", ""), requirement.get("technical_characteristics", "")]).lower()
        standard_text = " ".join([standard.get("title", ""), standard.get("description", ""), standard.get("keywords", ""), standard.get("technical_parameters", "")]).lower()
        for keyword in ["helmet", "safety", "impact", "head", "cable", "electrical", "tank", "water", "footwear", "industrial"]:
            if keyword in text and keyword in standard_text:
                matches += 10
        return min(96, max(55, 60 + matches))
