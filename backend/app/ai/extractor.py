import re


class RequirementExtractor:
    def extract(self, text: str) -> dict:
        cleaned = re.sub(r"\s+", " ", text).strip()
        lower = cleaned.lower()

        product = "Industrial safety helmet" if "helmet" in lower else "Electrical cable" if "cable" in lower else "Water storage tank" if "tank" in lower else "Safety footwear" if "shoe" in lower or "footwear" in lower else "General industrial product"
        product_category = "Industrial safety" if "helmet" in lower or "safety" in lower else "Electrical" if "cable" in lower else "Water/storage" if "tank" in lower else "PPE"
        application = "Construction / industrial work" if "construction" in lower else "Industrial power distribution" if "cable" in lower else "Municipal facility" if "municipal" in lower else "Industrial operations"
        industry = "Construction" if "construction" in lower else "Electrical" if "cable" in lower else "Water infrastructure" if "municipal" in lower else "Industrial"

        quantity_match = (
            re.search(r"(?:required\s+)?quantity\s*(?:is|:|=)?\s*(\d+(?:,\d+)*)", lower)
            or re.search(
                    r"(\d+(?:,\d+)*)\s+(?:[a-z-]+\s+){0,4}(?:units?|pieces?|nos\.?|items?|helmets?|cables?|tanks?|shoes?|footwear)",
                lower,
            )
        )
        quantity = quantity_match.group(1).replace(",", "") if quantity_match else "Not specified"

        safety_keywords = ["impact protection", "head protection", "safety", "electrical", "insulation", "waterproof", "corrosion resistance", "shock resistance"]
        safety = [kw for kw in safety_keywords if kw in lower]

        performance_keywords = ["industrial use", "withstand", "durability", "resistance", "temperature", "load", "specification"]
        performance = [kw for kw in performance_keywords if kw in lower]

        return {
            "product": product,
            "product_category": product_category,
            "application": application,
            "industry": industry,
            "quantity": quantity,
            "technical_characteristics": [*safety, *performance],
            "performance_requirements": performance,
            "safety_requirements": safety,
            "testing_requirements": ["Impact resistance testing", "Mechanical performance testing"] if "helmet" in lower else ["Electrical insulation testing", "Mechanical integrity testing"] if "cable" in lower else ["Leakage testing", "Structural integrity testing"] if "tank" in lower else ["Slip resistance testing", "Durability testing"],
            "certification_hints": ["IS certification review", "BIS conformity review"],
            "important_parameters": ["Material", "Dimension", "Load capacity", "Performance class", "Safety class"],
            "other_constraints": ["Procurement officer review required"],
            "raw_text": cleaned,
        }
