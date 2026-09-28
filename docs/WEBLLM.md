# WebLLM Dedicated-Worker Architecture

The app integrates MLC AI WebLLM 0.2.85 as an **optional browser-local planning engine**.

## Main-thread / worker split

`modules/webllm-adapter.js` creates a module Worker from `modules/webllm-worker.js`.

The worker instantiates WebLLM's documented `WebWorkerMLCEngineHandler`; the main thread creates a proxy engine with `CreateWebWorkerMLCEngine`. Heavy model execution therefore runs away from the primary UI thread.

The package is dynamically imported from the configured pinned URL only when the user requests model discovery/loading.

## Model cache

The adapter copies `prebuiltAppConfig` and sets:

```js
cacheBackend: 'indexeddb'
```

This follows WebLLM's documented IndexedDB cache option. The application service worker does not claim ownership of model artifacts.

## Fallback path

If WebGPU, a Worker, the package, a compatible model or initial model downloads are unavailable, `deterministicPlan()` returns a rule-based local planning scaffold. It detects themes such as rural distance, maternal/child access, broadband/telehealth, outages, affordability and school coordination.

The deterministic fallback is intentionally not generative AI and does not invent current facts.

## Safety / privacy

The local assistant is constrained to access/public-health planning and evidence literacy. It is told not to diagnose, prescribe, change medication dosing or guarantee eligibility.

Browser-local inference reduces server-side prompt exposure but is not a blanket privacy guarantee. Device administrators, browser extensions, shared screens, exports and compromised endpoints can still expose information. Use de-identified planning prompts.

## Offline behavior

A model already downloaded and fully cached may work offline depending on browser/WebLLM state. The app does not claim a model is offline-ready until that browser has actually cached it. First-load package/model retrieval is online-only.
