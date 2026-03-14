# Localization Preparation

## Purpose

This document captures the current approach for adding Norwegian later without breaking the English MVP.

## Current State

- The application UI remains English-only.
- The current active locale is `en`.
- The planned default locale after MVP stabilization is `nb` for Norwegian Bokmal.
- Product behavior, routing, AI prompts, and documentation still use English as the source language today.

## Preparation Already Implemented

- Frontend localization config exists in `apps/web/src/lib/localization.js`.
- The help and login experience explicitly communicate the current English-first policy and the future Norwegian default.
- Labels, role names, and UI text remain centralized enough to support later extraction.

## Recommended Next Localization Steps

1. Extract page copy and component labels into locale dictionaries.
2. Add `en` and `nb` message catalogs for the web app.
3. Introduce a user or workspace locale preference in persistence.
4. Decide whether AI prompts remain English internally or become locale-aware per request type.
5. Add Norwegian seed content after the workflow behavior is stable in English.

## Guardrails

- Do not partially translate the UI before the dictionary layer exists.
- Keep API contracts and internal database naming in English even after Norwegian becomes the default UI language.
- Keep prompts and output schemas deterministic during the first localization pass.
