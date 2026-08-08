// Protocol presentation and manual override adapter. The protocol contract lives in flight_control.js.
const protocolState = {
    shipUplinkRaw: {},
    shipUplinkEffective: {},
    platformUplinkReceived: {},
    platformDownlinkRaw: {},
    platformDownlinkEffective: {},
    shipDownlinkReceived: {},
    uplinkError: "",
    downlinkError: "",
};

const protocolDefinition = window.StarshipFlightProtocol.definition;

function buildFlightControlLinkEnv() {
    // Read the tower panel at the point the platform controller is evaluated.
    // The panel is the source of truth for the waypoint; this avoids retaining
    // a previous value until an input happens to lose focus.
    const approachConfig = readTowerApproachConfig();

    return {
        targetX: TOWER_WORLD_X,
        failures: towerFailureConfig,
        falseAuthorizationActive: falseTowerAuthorizationActive,
        approachDistance: approachConfig.distance,
        approachAngleDeg: approachConfig.angleDeg,
        approachTolerance: approachConfig.tolerance,
        uplinkOverride: getProtocolOverride("uplink"),
        downlinkOverride: getProtocolOverride("downlink"),
        machineInputs: {
            ...platformMachineInputs,
        },
    };
}

function syncProtocolStateFromSnapshot(snapshot) {
    const bus = snapshot?.bus ?? {};
    const platform = snapshot?.platform ?? {};

    protocolState.shipUplinkRaw = bus.uplinkRaw ?? {};
    protocolState.shipUplinkEffective = bus.uplinkTransmitted ?? {};
    protocolState.platformUplinkReceived = bus.uplinkReceivedByPlatform ?? {};
    protocolState.platformDownlinkRaw = platform.deliveredBase ?? {};
    protocolState.platformDownlinkEffective = bus.downlinkDelivered ?? {};
    protocolState.shipDownlinkReceived = bus.downlinkReceivedByShip ?? {};
}

function getProtocolDirectionConfig(direction) {
    return protocolDefinition[direction];
}

function getProtocolSignalDefinition(direction, key) {
    return getProtocolDirectionConfig(direction).signals.find((signal) => signal.key === key) ?? null;
}

function getProtocolWidgets(direction) {
    if (direction === "uplink") {
        return {
            enabled: protocolUplinkOverrideEnabled,
            editor: protocolUplinkOverrideText,
            monitor: protocolUplinkView,
            deliveryStatus: protocolUplinkDeliveryStatus,
            signalSelect: protocolUplinkSignalSelect,
            signalValueInput: protocolUplinkSignalValueInput,
        };
    }

    return {
        enabled: protocolDownlinkOverrideEnabled,
        editor: protocolDownlinkOverrideText,
        monitor: protocolDownlinkView,
        deliveryStatus: protocolDownlinkDeliveryStatus,
        signalSelect: protocolDownlinkSignalSelect,
        signalValueInput: protocolDownlinkSignalValueInput,
    };
}

function formatProtocolValue(value) {
    if (typeof value === "number") {
        return Number.isInteger(value) ? String(value) : value.toFixed(3);
    }

    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }

    return String(value);
}

function compareProtocolValues(expected, received) {
    if (typeof expected === "number" && typeof received === "number") {
        return Math.abs(expected - received) < 1e-9;
    }

    return JSON.stringify(expected) === JSON.stringify(received);
}

function buildProtocolDeliveryReport(direction, transmittedPacket, receivedPacket) {
    const override = getProtocolOverride(direction);

    if (!isLinkedMode()) {
        return "Stand-alone: enlace externo inativo.";
    }

    if (!flightController.isRouteLocked()) {
        return "Enlace desarmado pelo controlador de voo.";
    }

    if (!override.enabled) {
        return "Canal nominal roteado.";
    }

    if (override.error) {
        return override.error;
    }

    const forcedKeys = Object.keys(override.patch);

    if (forcedKeys.length === 0) {
        return "Override ativo, mas sem sinais forçados.";
    }

    const delivered = forcedKeys.filter((key) => compareProtocolValues(transmittedPacket?.[key], receivedPacket?.[key]));
    const missing = forcedKeys.filter((key) => !delivered.includes(key));

    if (missing.length === 0) {
        return `Entrega confirmada ${delivered.length}/${forcedKeys.length}: ${delivered.join(", ")}`;
    }

    return `Entrega parcial ${delivered.length}/${forcedKeys.length}. Divergentes: ${missing.join(", ")}`;
}

function formatProtocolPacket(direction) {
    const packet =
        direction === "uplink"
            ? {
                  origem: protocolState.shipUplinkRaw,
                  transmitido: protocolState.shipUplinkEffective,
                  recebido: protocolState.platformUplinkReceived,
              }
            : {
                  origem: protocolState.platformDownlinkRaw,
                  transmitido: protocolState.platformDownlinkEffective,
                  recebido: protocolState.shipDownlinkReceived,
              };

    return JSON.stringify(packet, null, 2);
}

function buildProtocolSignalLabel(signal) {
    const typeLabel = signal.group === "discrete" ? "D" : "A";
    const unit = signal.unit ? ` ${signal.unit}` : "";
    return `${typeLabel} | ${signal.key}${unit}`;
}

function buildProtocolSpecMarkup(direction) {
    const config = getProtocolDirectionConfig(direction);
    const analogSignals = config.signals.filter((signal) => signal.group === "analog");
    const discreteSignals = config.signals.filter((signal) => signal.group === "discrete");

    const renderSignals = (signals) =>
        signals
            .map((signal) => `<div><strong>${signal.key}</strong>${signal.unit ? ` [${signal.unit}]` : ""}: ${signal.description}</div>`)
            .join("");

    return `
        <div class="panelTitle">${config.label}</div>
        <div><strong>Quadro:</strong> ${config.frame}</div>
        <div><strong>Origem:</strong> ${config.source}</div>
        <div><strong>Destino:</strong> ${config.destination}</div>
        <div><strong>Analógicos:</strong></div>
        ${renderSignals(analogSignals)}
        <div style="margin-top:8px;"><strong>Discretos:</strong></div>
        ${renderSignals(discreteSignals)}
    `;
}

function updateProtocolSpecView() {
    const rulesMarkup = protocolDefinition.operatingRules.map((rule) => `<div>${rule}</div>`).join("");

    protocolSpecView.innerHTML = `
        <div class="panelTitle">${protocolDefinition.title} (${protocolDefinition.name} v${protocolDefinition.version})</div>
        ${rulesMarkup}
        <div style="margin-top:8px;">${buildProtocolSpecMarkup("uplink")}</div>
        <div style="margin-top:10px;">${buildProtocolSpecMarkup("downlink")}</div>
    `;
}

function populateProtocolSignalSelect(direction) {
    const { signalSelect } = getProtocolWidgets(direction);
    const config = getProtocolDirectionConfig(direction);
    signalSelect.innerHTML = config.signals
        .map((signal) => `<option value="${signal.key}">${buildProtocolSignalLabel(signal)}</option>`)
        .join("");
}

function updateProtocolSignalInputHint(direction) {
    const { signalSelect, signalValueInput } = getProtocolWidgets(direction);
    const signal = getProtocolSignalDefinition(direction, signalSelect.value);

    if (!signal) {
        signalValueInput.placeholder = "valor";
        return;
    }

    switch (signal.type) {
        case "boolean":
            signalValueInput.placeholder = "true | false";
            break;
        case "number":
            signalValueInput.placeholder = signal.unit ? `numero em ${signal.unit}` : "numero";
            break;
        default:
            signalValueInput.placeholder = "texto";
            break;
    }
}

function validateProtocolSignalValue(signal, value) {
    switch (signal.type) {
        case "boolean":
            return typeof value === "boolean";
        case "number":
            return typeof value === "number" && Number.isFinite(value);
        case "string":
            return typeof value === "string";
        default:
            return false;
    }
}

function validateProtocolPatch(direction, patch) {
    const config = getProtocolDirectionConfig(direction);
    const signalMap = new Map(config.signals.map((signal) => [signal.key, signal]));
    const normalizedPatch = {};

    for (const [key, value] of Object.entries(patch)) {
        const signal = signalMap.get(key);

        if (!signal) {
            return {
                ok: false,
                error: `Sinal desconhecido para ${direction}: ${key}`,
            };
        }

        if (!validateProtocolSignalValue(signal, value)) {
            return {
                ok: false,
                error: `Tipo invalido para ${key}. Esperado: ${signal.type}.`,
            };
        }

        normalizedPatch[key] = value;
    }

    return {
        ok: true,
        value: normalizedPatch,
    };
}

function coerceProtocolSignalValue(direction, key, rawValue) {
    const signal = getProtocolSignalDefinition(direction, key);

    if (!signal) {
        return {
            ok: false,
            error: `Sinal desconhecido: ${key}`,
        };
    }

    const trimmed = rawValue.trim();

    if (!trimmed && signal.type !== "string") {
        return {
            ok: false,
            error: `Informe um valor para ${key}.`,
        };
    }

    if (signal.type === "boolean") {
        const normalized = trimmed.toLowerCase();

        if (["true", "1", "sim", "verdadeiro", "on"].includes(normalized)) {
            return { ok: true, value: true };
        }

        if (["false", "0", "nao", "não", "falso", "off"].includes(normalized)) {
            return { ok: true, value: false };
        }

        return {
            ok: false,
            error: `Valor booleano invalido para ${key}. Use true/false.`,
        };
    }

    if (signal.type === "number") {
        const normalized = trimmed.replace(",", ".");
        const numericValue = Number(normalized);

        if (!Number.isFinite(numericValue)) {
            return {
                ok: false,
                error: `Valor numerico invalido para ${key}.`,
            };
        }

        return {
            ok: true,
            value: numericValue,
        };
    }

    return {
        ok: true,
        value: rawValue,
    };
}

function tryParseProtocolPatch(text) {
    const trimmed = text.trim();

    if (!trimmed) {
        return {
            ok: true,
            value: {},
        };
    }

    try {
        const value = JSON.parse(trimmed);

        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return {
                ok: false,
                error: "Override deve ser um objeto JSON.",
            };
        }

        return {
            ok: true,
            value,
        };
    } catch (error) {
        return {
            ok: false,
            error: `JSON inválido: ${error.message}`,
        };
    }
}

function getProtocolOverride(direction) {
    const { enabled, editor } = getProtocolWidgets(direction);
    const stateKey = direction === "uplink" ? "uplinkError" : "downlinkError";

    if (!enabled.checked) {
        protocolState[stateKey] = "";
        return {
            enabled: false,
            patch: {},
            error: "",
        };
    }

    const parsed = tryParseProtocolPatch(editor.value);

    if (!parsed.ok) {
        protocolState[stateKey] = parsed.error;
        return {
            enabled: true,
            patch: {},
            error: parsed.error,
        };
    }

    const validated = validateProtocolPatch(direction, parsed.value);

    if (!validated.ok) {
        protocolState[stateKey] = validated.error;
        return {
            enabled: true,
            patch: {},
            error: validated.error,
        };
    }

    protocolState[stateKey] = "";
    return {
        enabled: true,
        patch: validated.value,
        error: "",
    };
}

function applyProtocolPatch(direction, packet) {
    const override = getProtocolOverride(direction);

    if (!override.enabled || override.error) {
        return packet;
    }

    return {
        ...packet,
        ...override.patch,
    };
}

function refreshProtocolTransport() {
    if (!nav || !sensors) {
        updateProtocolViews();
        return;
    }

    refreshPlatformState(0);

    if (sensors.platformLink) {
        setSensorValue(sensors.platformLink, samplePlatformLink());
    }

    updateCaptureStatus();
}

function applySingleProtocolSignalOverride(direction) {
    const { enabled, editor, signalSelect, signalValueInput } = getProtocolWidgets(direction);
    const signalKey = signalSelect.value;
    const coercedValue = coerceProtocolSignalValue(direction, signalKey, signalValueInput.value);
    const stateKey = direction === "uplink" ? "uplinkError" : "downlinkError";

    if (!coercedValue.ok) {
        protocolState[stateKey] = coercedValue.error;
        updateProtocolViews();
        return;
    }

    const parsed = tryParseProtocolPatch(editor.value);
    let basePatch = {};

    if (parsed.ok) {
        const validated = validateProtocolPatch(direction, parsed.value);

        if (validated.ok) {
            basePatch = validated.value;
        }
    }

    const nextPatch = {
        ...basePatch,
        [signalKey]: coercedValue.value,
    };

    editor.value = JSON.stringify(nextPatch, null, 2);
    enabled.checked = true;
    protocolState[stateKey] = "";
    refreshProtocolTransport();
}

function clearProtocolOverride(direction) {
    const { enabled, editor, signalValueInput } = getProtocolWidgets(direction);
    const stateKey = direction === "uplink" ? "uplinkError" : "downlinkError";

    enabled.checked = false;
    editor.value = "{}";
    signalValueInput.value = "";
    protocolState[stateKey] = "";
    refreshProtocolTransport();
}

function updateProtocolStatus() {
    const modeLabel = `${flightControlState.controllerId} | ${getSelectedShipProfile().callsign} -> ${getSelectedPlatformProfile().label}`;
    const routeLabel = getFlightControlRouteActive()
        ? "enlace travado"
        : flightController.isRouteLocked()
          ? "aguardando linked mode"
          : "enlace desarmado";
    const feedbackLabel =
        flightControlState.shipFeedbackMode === "platform_isolated"
            ? "retorno isolado"
            : "malha fechada";
    const uplinkLabel = buildProtocolDeliveryReport(
        "uplink",
        protocolState.shipUplinkEffective,
        protocolState.platformUplinkReceived
    );
    const downlinkLabel = buildProtocolDeliveryReport(
        "downlink",
        protocolState.platformDownlinkEffective,
        protocolState.shipDownlinkReceived
    );

    protocolStatus.textContent = `${modeLabel} | ${routeLabel} | ${feedbackLabel} | uplink: ${uplinkLabel} | downlink: ${downlinkLabel}`;
}

function updateProtocolViews() {
    protocolUplinkView.textContent = formatProtocolPacket("uplink");
    protocolDownlinkView.textContent = formatProtocolPacket("downlink");
    protocolUplinkDeliveryStatus.textContent = buildProtocolDeliveryReport(
        "uplink",
        protocolState.shipUplinkEffective,
        protocolState.platformUplinkReceived
    );
    protocolDownlinkDeliveryStatus.textContent = buildProtocolDeliveryReport(
        "downlink",
        protocolState.platformDownlinkEffective,
        protocolState.shipDownlinkReceived
    );
    updateProtocolStatus();
}


