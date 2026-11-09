/**
 * Rodin Group LLC — Custom Interactive Architecture & Modern Web Guidance Runtime
 */
(function () {
  // 1. Invoker Commands Polyfill & Declarative Dialog Control (declarative-dialog-popover-control)
  const hasNativeInvoker = 'commandForElement' in HTMLButtonElement.prototype;
  if (!hasNativeInvoker) {
    (async () => {
      try {
        await import('https://esm.run/invokers-polyfill');
      } catch (err) {
        // Offline or blocked CDN fallback handled by manual delegation below
      }
    })();
  }

  document.addEventListener('click', (event) => {
    const button = event.composedPath().find((el) => el.matches?.('button[commandfor], a[commandfor]'));
    if (!button) return;
    const targetId = button.getAttribute('commandfor');
    const command = button.getAttribute('command');
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target || !command) return;

    if (target instanceof HTMLDialogElement) {
      event.preventDefault();
      if (command === 'show-modal') {
        if (!target.open) target.showModal();
      } else if (command === 'close') {
        if (target.open) target.close();
      }
    }
  });

  // 2. Light-Dismiss Fallback for <dialog closedby="any"> (light-dismiss-a-dialog)
  const initDialogLightDismiss = () => {
    const dialogs = document.querySelectorAll('dialog[closedby="any"]');
    dialogs.forEach((dialog) => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        dialog.addEventListener('click', (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isDialogContent =
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width;
          if (isDialogContent) return;
          dialog.close();
        });
      }
    });
  };

  // 3. Deferred Input Validation Fallback & ARIA Sync (validate-input-after-interaction)
  const UserInvalidFallback = (() => {
    const dirtyState = new WeakMap();

    const updateState = (input) => {
      const isValid = input.checkValidity();
      input.classList.toggle('user-invalid-fallback', !isValid);
      input.classList.toggle('user-valid-fallback', isValid);
      if (!isValid) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }
    };

    const handleEvent = (event) => {
      const input = event.target;
      if (event.type === 'reset') {
        const controls = input.elements || [];
        for (const control of controls) {
          dirtyState.delete(control);
          control.classList.remove('user-invalid-fallback', 'user-valid-fallback');
          control.removeAttribute('aria-invalid');
        }
        return;
      }
      if (!input.checkValidity) return;

      if (event.type === 'input' || event.type === 'change') {
        const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
        state.hasInteracted = true;
        dirtyState.set(input, state);
        if (state.hasBlurred) updateState(input);
      } else if (event.type === 'blur') {
        const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
        state.hasBlurred = true;
        dirtyState.set(input, state);
        if (state.hasInteracted) updateState(input);
      }
    };

    const init = (root = document) => {
      if (CSS.supports('selector(:user-invalid)')) return;
      root.addEventListener('blur', handleEvent, true);
      root.addEventListener('input', handleEvent);
      root.addEventListener('change', handleEvent);
      root.addEventListener('reset', handleEvent, true);
    };

    return { init };
  })();

  const syncAria = (el) => {
    if (!el || typeof el.matches !== 'function') return;
    if (CSS.supports('selector(:user-invalid)')) {
      el.setAttribute?.('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    }
  };

  document.addEventListener('blur', (e) => syncAria(e.target), true);
  document.addEventListener('input', (e) => {
    if (e.target && e.target.hasAttribute && e.target.hasAttribute('aria-invalid')) {
      syncAria(e.target);
    }
  });

  // 4. Case Studies Database for Interactive Architecture Modal (#case-modal)
  const CASE_STUDIES = {
    aetherpay: {
      name: 'AetherPay Core',
      category: 'FinTech Core & Distributed Ledger',
      metrics: '120,000 TPS · 14ms P99 Finality · $42B+ Annual Cleared Volume',
      stack: 'Rust · Go · Apache Kafka · PostgreSQL · Kubernetes · Hardware HSM',
      summary:
        'A high-frequency multi-currency clearing, settlement, and programmable treasury engine engineered by Rodin Group LLC for institutional payment orchestration.',
      architecture: [
        'Deterministic double-entry ledger core written in Rust with zero-allocation hot paths and cryptographic audit logs.',
        'Event-sourced settlement bus powered by multi-region Apache Kafka and idempotent ISO-20022 / SWIFT gpi connectors.',
        'Active-active global deployment across 3 cloud regions with automated sub-second failover and 99.999% SLA.'
      ]
    },
    nexusai: {
      name: 'NexusAI Studio',
      category: 'Enterprise AI & Multi-Agent Orchestration',
      metrics: '99.4% Grounded Accuracy · 180ms TTFT · 1.2M Daily Autonomous Runs',
      stack: 'Python · TypeScript · PyTorch · vLLM · Qdrant Vector DB · Next.js',
      summary:
        'An enterprise-grade multi-agent AI platform enabling Fortune 500 operations teams to deploy private, SOC 2 compliant RAG workflows and autonomous tool-using agents.',
      architecture: [
        'Hybrid semantic + lexical retrieval pipeline over 80M+ enterprise documents with real-time RBAC permission filtering.',
        'Custom vLLM & TensorRT-LLM inference gateway with dynamic LoRA adapter routing and semantic response caching.',
        'Deterministic guardrail layer enforcing schema validation, PII redaction, and full OpenTelemetry trace observability.'
      ]
    },
    vanguard: {
      name: 'VanguardMesh',
      category: 'Cloud-Native Infrastructure & Control Plane',
      metrics: '99.99% Uptime SLA · 48% Cloud Cost Reduction · 400+ Clusters Managed',
      stack: 'Go · eBPF · Cilium · Terraform · ArgoCD · Prometheus · Rust',
      summary:
        'A multi-cloud Kubernetes control plane and zero-trust service mesh automating workload placement, spot-instance orchestration, and mTLS security.',
      architecture: [
        'Kernel-level eBPF packet inspection and L7 observability with near-zero CPU overhead across bare-metal and cloud nodes.',
        'Predictive autoscaler trained on historical telemetry to pre-warm compute nodes 90 seconds before traffic spikes.',
        'GitOps-driven declarative infrastructure engine with automated canary rollbacks and chaos-engineering verification.'
      ]
    },
    chronos: {
      name: 'Chronos ERP',
      category: 'Enterprise Supply Chain & Autonomous Logistics',
      metrics: '3.8x Inventory Turnover · 64 Warehouses Connected · <50ms Sync',
      stack: 'TypeScript · Next.js · Node.js · GraphQL · PostgreSQL · Redis',
      summary:
        'A custom real-time enterprise resource planning and autonomous warehouse orchestration platform replacing legacy monolithic ERP suites.',
      architecture: [
        'Distributed inventory state machine synchronizing 64 global fulfillment centers with conflict-free replicated data types (CRDTs).',
        'Real-time demand forecasting and automated purchase-order generation integrated with EDI and SAP/Oracle legacy bridges.',
        'High-density keyboard-first operator web console built with React, WebSockets, and offline-first IndexedDB resilience.'
      ]
    },
    helios: {
      name: 'HeliosMed Cloud',
      category: 'HealthTech AI & Diagnostic Imaging',
      metrics: 'HIPAA / FDA Class II Aligned · 4.2x Faster Triage · 60fps WebGPU',
      stack: 'Rust · WebAssembly · WebGPU · React · Python · MONAI · DICOMweb',
      summary:
        'A zero-footprint browser-based 3D medical imaging viewer and AI-assisted diagnostic triage platform for hospital radiology networks.',
      architecture: [
        'Custom Rust-to-WebAssembly + WebGPU volumetric rendering engine streaming multi-gigabyte CT/MRI studies in under 1.5 seconds.',
        'Automated 3D organ segmentation and anomaly prioritization pipeline running on dedicated GPU inference clusters.',
        'End-to-end zero-trust encryption, HL7 FHIR / PACS integration, and immutable HIPAA compliance audit trails.'
      ]
    },
    strata: {
      name: 'StrataStream OLAP',
      category: 'Petabyte Data Engineering & Real-Time Analytics',
      metrics: '4.5M Events/sec · Sub-200ms Queries on 100B+ Rows · Zero Data Loss',
      stack: 'ClickHouse · Apache Flink · Rust · Apache Iceberg · Kafka · Go',
      summary:
        'A unified streaming lakehouse and real-time operational analytics platform engineered for high-volume telemetry and customer intelligence.',
      architecture: [
        'High-throughput Rust ingestion edge validating, deduplicating, and schema-evolving 4.5M JSON/Protobuf events per second.',
        'Stateful stream processing in Apache Flink materializing real-time feature views into ClickHouse and Apache Iceberg.',
        'Multi-tenant query federation engine with sub-200ms P95 response times for embedded customer-facing dashboards.'
      ]
    },
    kinetix: {
      name: 'Kinetix IoT Suite',
      category: 'Industrial Edge Telemetry & Mobile OS',
      metrics: '280,000 Connected Devices · 99.98% Edge Sync · iOS / Android / Embedded',
      stack: 'Swift · Kotlin · Rust Embedded · MQTT · TimescaleDB · React Native',
      summary:
        'An end-to-end industrial IoT firmware, low-latency MQTT broker mesh, and cross-platform mobile command suite for connected hardware fleets.',
      architecture: [
        'Memory-safe embedded Rust daemon with delta-compressed OTA firmware updates and offline ring-buffer persistence.',
        'Geo-distributed MQTT 5.0 broker cluster handling 280k concurrent persistent bi-directional device sessions.',
        'Native-grade mobile field engineering application with BLE diagnostics, AR hardware overlays, and instant telemetry charts.'
      ]
    },
    quantvault: {
      name: 'QuantVault Execution',
      category: 'Institutional FinTech & Algorithmic Risk Engine',
      metrics: '85μs Tick-to-Order · $18B Daily Notional · 40+ Liquidity Venues',
      stack: 'C++20 · Rust · Solarflareonload · FIX 4.4 / SBE · TypeScript · WebGL',
      summary:
        'An ultra-low-latency smart order router, pre-trade risk engine, and real-time portfolio margin workstation for institutional asset managers.',
      architecture: [
        'Lock-free C++20 and Rust matching & routing core utilizing kernel-bypass networking for sub-100 microsecond execution.',
        'Real-time Value-at-Risk (VaR) and cross-venue margin calculation engine evaluating 50,000 portfolio scenarios per second.',
        'Hardware-accelerated WebGL workstation streaming live depth-of-book heatmaps and execution analytics at 120Hz.'
      ]
    },
    omnib2b: {
      name: 'OmniB2B Commerce',
      category: 'Composable Global B2B Commerce Architecture',
      metrics: '+68% Conversion Lift · 190 Countries · 22ms Edge Page Loads',
      stack: 'Next.js · TypeScript · Go · PostgreSQL · Elasticsearch · Stripe / Adyen',
      summary:
        'A headless, multi-region B2B commerce and CPQ (Configure-Price-Quote) platform built for complex industrial catalogs with 5M+ SKUs.',
      architecture: [
        'Edge-cached storefront and custom CPQ rules engine capable of computing contract-specific tiered pricing in <15ms.',
        'Distributed order management system (OMS) orchestrating split shipments, credit limits, and multi-currency invoicing.',
        'Hybrid vector + faceted product search powered by Elasticsearch with instant CAD/blueprint part matching.'
      ]
    },
    sentinel: {
      name: 'SentinelSec Mesh',
      category: 'Cybersecurity, eBPF & Automated DevSecOps',
      metrics: 'Zero-Day Runtime Blocking · <0.8% CPU Overhead · SOC 2 / ISO 27001',
      stack: 'Go · C / eBPF · Rust · OpenTelemetry · ClickHouse · React',
      summary:
        'An autonomous cloud security posture management (CSPM) and runtime threat detection platform engineered for regulated cloud workloads.',
      architecture: [
        'Linux eBPF kernel sensors capturing syscall anomalies, unauthorized process execution, and lateral network movement in real time.',
        'Automated CI/CD supply-chain attestation verifying SBOMs, container signatures, and IaC policy compliance before deploy.',
        'Graph-based attack-path analyzer correlating cloud IAM permissions with live runtime vulnerability exposure.'
      ]
    },
    pulsebio: {
      name: 'PulseBio Compute',
      category: 'Bioinformatics SaaS & Distributed GPU Cloud',
      metrics: '12,000 GPU Hours/Day · 6.5x Pipeline Speedup · 21 CFR Part 11',
      stack: 'Python · Rust · Nextflow · AWS Batch / Kubernetes · React · FastAPI',
      summary:
        'A cloud-native bioinformatics workflow orchestrator and collaborative molecular discovery platform for computational biology teams.',
      architecture: [
        'DAG workflow scheduler dynamically provisioning spot GPU/HPC instances with checkpoint/restore fault tolerance.',
        'High-speed columnar assay data lake with interactive WebGL single-cell and structural visualization tools.',
        'Full GxP and FDA 21 CFR Part 11 electronic signature, lineage tracking, and reproducible container provenance.'
      ]
    },
    vertex: {
      name: 'VertexFleet OS',
      category: 'Geospatial Dispatch & Autonomous Routing',
      metrics: '24% Fuel & Time Savings · 1.4M Daily Deliveries · Sub-Second Re-Routing',
      stack: 'Go · Rust · PostGIS · OSRM · React Native · Apache Kafka',
      summary:
        'A real-time geospatial dispatch optimization and fleet telemetry platform solving dynamic vehicle routing problems (VRP) at metropolitan scale.',
      architecture: [
        'Custom Rust heuristic solver continuously optimizing 15,000+ active delivery routes against live traffic and time-window constraints.',
        'High-frequency geospatial indexing engine built on H3 hexagonal grids and PostGIS for instant geofence triggers.',
        'Offline-resilient driver mobile OS with turn-by-turn navigation, barcode scanning, and proof-of-delivery capture.'
      ]
    },
    hyperion: {
      name: 'Hyperion IDP',
      category: 'Internal Developer Portal & Platform Engineering',
      metrics: '4.1x Deployment Frequency · 15-Min Service Onboarding · 600+ Microservices',
      stack: 'TypeScript · Go · Kubernetes · Crossplane · Backstage · GraphQL',
      summary:
        'An enterprise Internal Developer Portal (IDP) and self-service platform engineering plane standardizing microservice creation, CI/CD, and cloud provisioning.',
      architecture: [
        'Golden-path scaffolding engine provisioning production-ready repos, CI/CD pipelines, and Kubernetes namespaces in 90 seconds.',
        'Live service catalog and dependency graph tracking DORA metrics, API contracts, SLO burn rates, and cloud unit economics.',
        'Declarative infrastructure-as-data plane powered by Crossplane for self-service RDS, Redis, and Kafka provisioning.'
      ]
    }
  };

  const initCaseStudyModal = () => {
    const modal = document.getElementById('case-modal');
    if (!modal) return;

    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-case-study]');
      if (!card) return;
      e.preventDefault();
      const key = card.getAttribute('data-case-study');
      const data = CASE_STUDIES[key] || CASE_STUDIES.aetherpay;

      const titleEl = modal.querySelector('[data-case-title]');
      const catEl = modal.querySelector('[data-case-category]');
      const metricsEl = modal.querySelector('[data-case-metrics]');
      const stackEl = modal.querySelector('[data-case-stack]');
      const summaryEl = modal.querySelector('[data-case-summary]');
      const archListEl = modal.querySelector('[data-case-arch]');
      const ctaBtn = modal.querySelector('[data-case-request]');

      if (titleEl) titleEl.textContent = data.name;
      if (catEl) catEl.textContent = data.category;
      if (metricsEl) metricsEl.textContent = data.metrics;
      if (stackEl) stackEl.textContent = data.stack;
      if (summaryEl) summaryEl.textContent = data.summary;
      if (archListEl) {
        archListEl.innerHTML = data.architecture
          .map(
            (item, idx) =>
              `<li style="display:flex;gap:0.75em;align-items:flex-start;padding:0.65em 0;border-bottom:1px solid rgba(255,255,255,0.08);"><span style="font-family:'TWK Everett Mono',monospace;color:#1E6EF3;font-size:0.8em;">0${idx + 1}</span><span style="color:#EFEFEB;font-size:0.92em;line-height:1.5;">${item}</span></li>`
          )
          .join('');
      }
      if (ctaBtn) {
        ctaBtn.onclick = () => {
          modal.close();
          const projModal = document.getElementById('project-modal');
          if (projModal) {
            const notes = projModal.querySelector('textarea[name="project_brief"]');
            if (notes && !notes.value) {
              notes.value = `Interested in an architecture similar to ${data.name} (${data.category}).`;
            }
            projModal.showModal();
          }
        };
      }

      modal.showModal();
    });
  };

  // 5. Interactive Project Configurator & Estimator (Section + Modal)
  const SCOPE_DATA = {
    'cloud-platform': {
      squad: '1 Principal Architect · 3 Senior Full-Stack · 1 DevSecOps',
      stack: 'TypeScript / Next.js · Go / Rust APIs · PostgreSQL · Kubernetes',
      sprint: 'MVP in 6–8 Weeks · Production V1 in 10–14 Weeks'
    },
    'ai-systems': {
      squad: '1 AI/ML Architect · 2 Applied AI Engineers · 1 Data/Backend Eng',
      stack: 'Python · vLLM / OpenAI / Anthropic · Qdrant RAG · TypeScript',
      sprint: 'PoC in 3 Weeks · Enterprise Production in 8–10 Weeks'
    },
    'fintech-core': {
      squad: '1 Distributed Systems Principal · 3 Rust/Go Core · 1 Security QA',
      stack: 'Rust · Go · Kafka · PostgreSQL · HSM / Zero-Trust Mesh',
      sprint: 'Architecture Blueprint in 2 Weeks · Core Ledger in 12–16 Weeks'
    },
    'mobile-iot': {
      squad: '1 Mobile Lead · 2 iOS/Android/Edge Engineers · 1 Cloud API Eng',
      stack: 'Swift / Kotlin / React Native · Rust Edge · MQTT / WebSockets',
      sprint: 'Interactive Prototype in 3 Weeks · App Store Launch in 8–12 Weeks'
    },
    'dedicated-squad': {
      squad: 'Dedicated Pod (3 to 8 Senior Engineers + Technical Product Lead)',
      stack: 'Tailored to Your Stack · Embedded CI/CD · 100% IP Assignment',
      sprint: 'Squad Kickoff in 5 Business Days · Bi-Weekly Production Releases'
    }
  };

  const initProjectConfigurators = () => {
    document.querySelectorAll('[data-configurator]').forEach((container) => {
      const pills = container.querySelectorAll('[data-scope-key]');
      const squadEl = container.querySelector('[data-est-squad]');
      const stackEl = container.querySelector('[data-est-stack]');
      const sprintEl = container.querySelector('[data-est-sprint]');
      const hiddenScope = container.querySelector('input[name="selected_scope"]');

      pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          const key = pill.getAttribute('data-scope-key');
          pills.forEach((p) => {
            const active = p === pill;
            p.classList.toggle('is-active', active);
            p.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          const info = SCOPE_DATA[key] || SCOPE_DATA['cloud-platform'];
          if (squadEl) squadEl.textContent = info.squad;
          if (stackEl) stackEl.textContent = info.stack;
          if (sprintEl) sprintEl.textContent = info.sprint;
          if (hiddenScope) hiddenScope.value = pill.textContent.trim();
        });
      });

      const form = container.querySelector('form');
      if (form) {
        UserInvalidFallback.init(form);
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (!form.checkValidity()) {
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) firstInvalid.focus();
            return;
          }
          const formData = new FormData(form);
          const name = formData.get('client_name') || 'Partner';
          const company = formData.get('client_company') || 'Your Organization';
          const scope = formData.get('selected_scope') || 'Custom Software Architecture';
          const banner = container.querySelector('.rodin-status-banner');
          if (banner) {
            banner.innerHTML = `<strong>Mandate Received — Reference #RDN-${Math.floor(100000 + Math.random() * 900000)}</strong><br/>Thank you, ${name} (${company}). Balázs Lederer & our Principal Architecture team at Rodin Group LLC (Lander, WY) have logged your <em>${scope}</em> brief and will respond within 4 business hours.`;
            banner.classList.add('is-visible');
          }
          form.reset();
        });
      }
    });
  };

  // 6. Accessible Pause Control for Continuous Marquee Carousel (motion guide)
  const initCarouselPauseControl = () => {
    const pauseBtns = document.querySelectorAll('[data-carousel-toggle]');
    pauseBtns.forEach((btn) => {
      let paused = false;
      btn.addEventListener('click', () => {
        paused = !paused;
        btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
        btn.textContent = paused ? '▶ Resume Marquee' : '❚❚ Pause Marquee';
        const tracks = document.querySelectorAll('[data-carousel-track]');
        tracks.forEach((t) => {
          t.style.pointerEvents = paused ? 'none' : '';
          t.closest('[data-carousel]')?.classList.toggle('is-paused-by-user', paused);
        });
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    initDialogLightDismiss();
    initCaseStudyModal();
    initProjectConfigurators();
    initCarouselPauseControl();
  });
})();
