(function () {
function escapeHtmlText(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function buildControlLoopMetricMarkup(metric, gains, gainSpecMap) {
    if (typeof metric === "string") {
        return `<div class="controlLoopMetric">${escapeHtmlText(metric)}</div>`;
    }

    if (!metric || !metric.gainKey) {
        return "";
    }

    const spec = gainSpecMap[metric.gainKey];

    if (!spec) {
        return `<div class="controlLoopMetric">${escapeHtmlText(metric.label ?? metric.gainKey)}</div>`;
    }

    return `
        <label class="controlLoopGainField" title="${escapeHtmlText(spec.label)}">
            <span class="controlLoopGainFieldLabel">${escapeHtmlText(metric.label ?? spec.label)}</span>
            <input
                class="controlLoopGainFieldInput"
                type="number"
                inputmode="decimal"
                min="${spec.min}"
                max="${spec.max}"
                step="${spec.step}"
                value="${formatGainValue(gains[spec.key], spec.step)}"
                data-gain-key="${spec.key}"
                data-gain-step="${spec.step}"
                aria-label="${escapeHtmlText(spec.label)}"
            />
        </label>
    `;
}

function buildControlLoopNodeMarkup({ variant = "", eyebrow, title, metrics = [] }, gains, gainSpecMap) {
    const safeVariant = variant ? ` controlLoopNode--${variant}` : "";

    return `
        <div class="controlLoopNode${safeVariant}">
            <div class="controlLoopNodeEyebrow">${escapeHtmlText(eyebrow)}</div>
            <div class="controlLoopNodeTitle">${escapeHtmlText(title)}</div>
            <div class="controlLoopMetricList">
                ${metrics.map((metric) => buildControlLoopMetricMarkup(metric, gains, gainSpecMap)).join("")}
            </div>
        </div>
    `;
}

function buildControlLoopOutputMarkup({ title, metrics = [] }, gains, gainSpecMap) {
    return `
        <div class="controlLoopOutput">
            <div class="controlLoopOutputTitle">${escapeHtmlText(title)}</div>
            <div class="controlLoopMetricList">
                ${metrics.map((metric) => buildControlLoopMetricMarkup(metric, gains, gainSpecMap)).join("")}
            </div>
        </div>
    `;
}

function buildControlLoopNoteMarkup(title, text) {
    return `
        <div class="controlLoopNote">
            <div class="controlLoopNoteTitle">${escapeHtmlText(title)}</div>
            <div class="controlLoopNoteBody">${escapeHtmlText(text)}</div>
        </div>
    `;
}

function buildControlLoopDiagramMarkup(gains, gainSpecs) {
    const gainSpecMap = Object.fromEntries(gainSpecs.map((spec) => [spec.key, spec]));

    return `
        <div class="controlLoopCard">
            <div class="controlLoopTitle">Malha de Atitude</div>
            <div class="controlLoopFlow controlLoopFlow--attitude">
                ${buildControlLoopNodeMarkup({
                    variant: "reference",
                    eyebrow: "Referencia",
                    title: "targetAngle",
                    metrics: [
                        { gainKey: "bellyEntryAngleDeg", label: "Belly SP" },
                        "base do belly antes do flip"
                    ]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "sum",
                    eyebrow: "Comparador",
                    title: "erro angular",
                    metrics: ["targetAngle - nav.a"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "controller",
                    eyebrow: "Controlador",
                    title: "Atitude",
                    metrics: [
                        { gainKey: "attitudeEntryGain", label: "Entry" },
                        { gainKey: "attitudeTerminalGain", label: "Terminal" }
                    ]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "plant",
                    eyebrow: "Planta",
                    title: "Nave",
                    metrics: ["nav.a", "nav.w", "q"]
                }, gains, gainSpecMap)}
            </div>
            <div class="controlLoopOutputsLabel">Saidas do controlador</div>
            <div class="controlLoopOutputs controlLoopOutputs--triple">
                ${buildControlLoopOutputMarkup({
                    title: "RCS",
                    metrics: [
                        { gainKey: "rcsEntryGain", label: "Entry" },
                        { gainKey: "rcsTerminalGain", label: "Terminal" }
                    ]
                }, gains, gainSpecMap)}
                ${buildControlLoopOutputMarkup({
                    title: "Gimbal / TVC",
                    metrics: [
                        { gainKey: "gimbalEntryGain", label: "Entry" },
                        { gainKey: "gimbalFlipGain", label: "Flip" },
                        { gainKey: "gimbalLandingGain", label: "Land" }
                    ]
                }, gains, gainSpecMap)}
                ${buildControlLoopOutputMarkup({
                    title: "Flaps",
                    metrics: [{ gainKey: "flapAuthorityGain", label: "Authority" }]
                }, gains, gainSpecMap)}
            </div>
            <div class="controlLoopFeedback">
                Feedback: nav.a, nav.w e pressao dinamica q | targetAngle = belly SP + correcao lateral
            </div>
        </div>
        <div class="controlLoopCard">
            <div class="controlLoopTitle">Malha PID de Decolagem</div>
            <div class="controlLoopFlow controlLoopFlow--vertical">
                ${buildControlLoopNodeMarkup({
                    variant: "reference",
                    eyebrow: "Referencia",
                    title: "targetZ",
                    metrics: ["entrada em degrau de altitude"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "sum",
                    eyebrow: "Comparador",
                    title: "erro Z",
                    metrics: ["targetZ - nav.z", "feedback derivativo por nav.vz"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "controller",
                    eyebrow: "Controlador",
                    title: "PID Altitude",
                    metrics: [
                        { gainKey: "takeoffPositionPGain", label: "Z P" },
                        { gainKey: "takeoffPositionIGain", label: "Z I" },
                        { gainKey: "takeoffVelocityDGain", label: "D" }
                    ]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "controller",
                    eyebrow: "Malha interna",
                    title: "Takeoff Throttle PI",
                    metrics: [
                        { gainKey: "takeoffThrottlePGain", label: "P" },
                        { gainKey: "takeoffThrottleIGain", label: "I" }
                    ]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "plant",
                    eyebrow: "Planta",
                    title: "Nave",
                    metrics: ["nav.z", "nav.vz"]
                }, gains, gainSpecMap)}
            </div>
            <div class="controlLoopOutputsLabel">Observacao</div>
            ${buildControlLoopNoteMarkup("Lei de controle", "degrau em Zsp -> PID de altitude -> alvo Vz -> throttle PI")}
            <div class="controlLoopFeedback">Ativo apenas em teste de decolagem ate o fim do hold</div>
        </div>
        <div class="controlLoopCard">
            <div class="controlLoopTitle">Malha Vertical / Throttle</div>
            <div class="controlLoopFlow controlLoopFlow--vertical">
                ${buildControlLoopNodeMarkup({
                    variant: "reference",
                    eyebrow: "Referencia",
                    title: "targetVz",
                    metrics: ["taxa vertical alvo"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "sum",
                    eyebrow: "Comparador",
                    title: "erro Vz",
                    metrics: ["targetVz - nav.vz"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "controller",
                    eyebrow: "Controlador",
                    title: "Throttle PI — Descida",
                    metrics: [
                        { gainKey: "throttlePGain", label: "P" },
                        { gainKey: "throttleIGain", label: "I" }
                    ]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "actuator",
                    eyebrow: "Atuador",
                    title: "Motor",
                    metrics: ["throttle -> empuxo"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "plant",
                    eyebrow: "Planta",
                    title: "Nave",
                    metrics: ["nav.vz"]
                }, gains, gainSpecMap)}
            </div>
            <div class="controlLoopOutputsLabel">Malha Externa</div>
            <div class="controlLoopOutputs controlLoopOutputs--double">
                ${buildControlLoopOutputMarkup({
                    title: "Altitude PI",
                    metrics: [
                        { gainKey: "altitudePGain", label: "P" },
                        { gainKey: "altitudeIGain", label: "I" }
                    ]
                }, gains, gainSpecMap)}
                ${buildControlLoopOutputMarkup({
                    title: "Sequenciador",
                    metrics: ["targetZ -> targetVz", "ativo na recuperacao e pouso"]
                }, gains, gainSpecMap)}
            </div>
            <div class="controlLoopOutputsLabel">Observacao</div>
            ${buildControlLoopNoteMarkup("Lei de controle", "hover throttle + erro Vz + integral | usado fora da etapa de decolagem")}
            <div class="controlLoopFeedback">Feedback: velocidade vertical medida</div>
        </div>
    `;
}

function updateShipGainPanel() {
    const controller = getSelectedShipController();

    if (!controller) {
        shipGainProfileLabel.textContent = "Nave ativa: indisponível";
        shipControlLoopView.innerHTML = "";
        return;
    }

    const profile = getSelectedShipProfile();
    const gains = controller.getControlGains();
    const specs = controller.getControlGainSpecs();

    shipGainProfileLabel.textContent = `Nave ativa: ${profile.label} (${profile.callsign})`;
    shipControlLoopView.innerHTML = buildControlLoopDiagramMarkup(gains, specs);
}

function handleShipGainInput(input, finalize = false) {
    const controller = getSelectedShipController();

    if (!controller) {
        return;
    }

    const gainKey = input.dataset.gainKey;
    const step = Number(input.dataset.gainStep);
    const nextValue = input.valueAsNumber;

    if (gainKey && Number.isFinite(nextValue)) {
        controller.setControlGain(gainKey, nextValue);
    }

    if (!finalize || !gainKey) {
        return;
    }

    const currentValue = controller.getControlGains()[gainKey];

    if (typeof currentValue === "number" && Number.isFinite(currentValue)) {
        input.value = formatGainValue(currentValue, step);
    }
}

window.StarshipControlLoopView = Object.freeze({
    escapeHtmlText,
    buildControlLoopMetricMarkup,
    buildControlLoopNodeMarkup,
    buildControlLoopOutputMarkup,
    buildControlLoopNoteMarkup,
    buildControlLoopDiagramMarkup,
    updateShipGainPanel,
    handleShipGainInput,
});
})();
