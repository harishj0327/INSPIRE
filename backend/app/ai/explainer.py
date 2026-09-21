class ExplanationGenerator:
    def explain(self, requirement: dict, standard: dict) -> str:
        product = requirement.get("product") or "the requested product"
        application = requirement.get("application") or "the intended application"
        requirements = requirement.get("technical_characteristics") or []
        req_summary = ", ".join(requirements[:3]) if requirements else "required technical properties"
        standard_title = standard.get("title") or "the identified standard"
        category = standard.get("category") or "the relevant category"
        scope = standard.get("scope") or standard.get("description") or ""
        app_match = standard.get("application") or ""
        reason = (
            f"Recommended because the requirement specifies {product.lower()} for {application.lower()}, "
            f"which matches this standard's recorded product category and application context. "
            f"The requirement highlights {req_summary}, and the standard record is aligned to {category.lower()} with scope: {scope[:180]}"
        )
        if app_match and app_match.lower() in (application or "").lower():
            reason += " The application context is consistent with the standard record."
        return reason
