def validate_recommendation_source(requirement: dict, standard: dict) -> bool:
    if not standard:
        return False
    if not standard.get("id"):
        return False
    if not standard.get("is_number"):
        return False
    if not standard.get("title"):
        return False
    requirement_text = " ".join([
        requirement.get("product") or "",
        requirement.get("product_category") or "",
        requirement.get("application") or "",
        requirement.get("industry") or "",
        * (requirement.get("technical_characteristics") or []),
        * (requirement.get("performance_requirements") or []),
        * (requirement.get("safety_requirements") or []),
    ]).lower()
    standard_text = " ".join([
        standard.get("title") or "",
        standard.get("description") or "",
        standard.get("keywords") or "",
        standard.get("technical_parameters") or "",
        standard.get("category") or "",
        standard.get("application") or "",
        standard.get("product_type") or "",
        standard.get("scope") or "",
    ]).lower()
    return bool(requirement_text) and bool(standard_text) and any(token in requirement_text and token in standard_text for token in ["helmet", "safety", "impact", "electrical", "cable", "tank", "water", "footwear", "industrial", "construction"])


def rank_records(requirement: dict, standards: list[dict]) -> list[dict]:
    ranked = []
    for standard in standards:
        score = 55
        title = (standard.get("title") or "").lower()
        field_text = " ".join([
            standard.get("description") or "",
            standard.get("keywords") or "",
            standard.get("technical_parameters") or "",
            standard.get("category") or "",
            standard.get("application") or "",
            standard.get("product_type") or "",
            standard.get("scope") or "",
        ]).lower()
        req_text = " ".join([
            requirement.get("product") or "",
            requirement.get("product_category") or "",
            requirement.get("application") or "",
            requirement.get("industry") or "",
            " ".join(requirement.get("technical_characteristics") or []),
            " ".join(requirement.get("performance_requirements") or []),
            " ".join(requirement.get("safety_requirements") or []),
        ]).lower()
        for token in ["helmet", "safety", "impact", "electrical", "cable", "tank", "water", "footwear", "industrial", "construction"]:
            if token in req_text and token in field_text:
                score += 8
        if requirement.get("product") and requirement.get("product").lower() in title:
            score += 12
        if requirement.get("application") and requirement.get("application").lower() in field_text:
            score += 8
        if standard.get("category") and standard.get("category").lower() in req_text:
            score += 6
        if standard.get("technical_parameters"):
            score += 3
        ranked.append({**standard, "score": min(score, 96)})
    ranked = sorted(ranked, key=lambda x: x["score"], reverse=True)
    return [item for item in ranked if validate_recommendation_source(requirement, item)]
