// UI composition. Loaded after main.js so all mission state and callbacks are ready.
(function () {
    const mobileViewport = window.matchMedia("(max-width: 720px)");

    function syncMobileHudLayout(matchesMobileViewport) {
        if (matchesMobileViewport) {
            hud.classList.add("is-collapsed");
            toggleHudBtn.textContent = "☰";
            toggleHudBtn.title = "Abrir controles";
            toggleHudBtn.setAttribute("aria-expanded", "false");
        } else {
            hud.classList.remove("is-collapsed");
            toggleHudBtn.textContent = "‹";
            toggleHudBtn.title = "Recolher menu";
            toggleHudBtn.setAttribute("aria-expanded", "true");
        }
    }

    syncMobileHudLayout(mobileViewport.matches);
    // Safari versions still common on mobile expose the legacy listener API
    // on MediaQueryList. Falling back prevents the UI bindings from aborting
    // during startup on those devices.
    if (typeof mobileViewport.addEventListener === "function") {
        mobileViewport.addEventListener("change", (event) => syncMobileHudLayout(event.matches));
    } else if (typeof mobileViewport.addListener === "function") {
        mobileViewport.addListener((event) => syncMobileHudLayout(event.matches));
    }

    speedButtons.forEach((button) => {
        button.addEventListener("click", () => { sim = Number(button.dataset.speed); updateSimulationSpeedUI(); });
    });
    toggleHudBtn.addEventListener("click", () => {
        const isCollapsed = hud.classList.toggle("is-collapsed");
        const isMobile = mobileViewport.matches;
        toggleHudBtn.textContent = isCollapsed ? (isMobile ? "☰" : "›") : "‹";
        toggleHudBtn.title = isCollapsed ? (isMobile ? "Abrir controles" : "Expandir menu") : "Recolher menu";
        toggleHudBtn.setAttribute("aria-expanded", String(!isCollapsed));
    });
    toggleTelemetryHudStyleBtn.addEventListener("click", () => {
        telemetryHudStyle = telemetryHudStyle === "engineering" ? "spacex" : "engineering";
        toggleTelemetryHudStyleBtn.textContent = telemetryHudStyle === "spacex" ? "HUD: Engenharia" : "HUD: SpaceX";
    });
    bindModal(protocolModal, openProtocolModalBtn, closeProtocolModalBtn);
    bindModal(telemetryModal, openTelemetryModalBtn, closeTelemetryModalBtn);
    bindModal(physicsModal, openPhysicsModalBtn, closePhysicsModalBtn);
    bindModal(shipModal, openShipModalBtn, closeShipModalBtn);
    bindModal(towerModal, openTowerModalBtn, closeTowerModalBtn);
    bindModal(terraMapModal, openTerraMapBtn, closeTerraMapModalBtn);
    initializeModalPosition(protocolModal, 520, 120);
    initializeModalPosition(telemetryModal, 420, 56);
    initializeModalPosition(physicsModal, Math.max(460, window.innerWidth - 520), 420);
    initializeModalPosition(shipModal, 420, 56);
    initializeModalPosition(towerModal, Math.max(460, window.innerWidth - 520), 88);
    initializeModalPosition(terraMapModal, Math.max(16, (window.innerWidth - 1240) / 2), 28);
    [protocolModal, telemetryModal, physicsModal, shipModal, towerModal, terraMapModal].forEach(makeModalDraggable);
    terraMapView = new window.TerraMapView({
        canvas: terraMapCanvas, input: terraMapTargetInput, applyButton: applyTerraMapTargetBtn, readout: terraMapReadout,
        onTarget: (targetX) => {
            if (isProbeSelected()) {
                if (!started && setProbePosition(targetX)) { sceneFocusX = targetX; terraMapView.setState(getTerraMapState()); }
            } else if (!isLinkedMode()) { setLandingTarget(targetX); sceneFocusX = targetX; terraMapView.setState(getTerraMapState()); }
        },
    });
    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeAllModals();
        if (!probeManualRcsActive || !started || !isProbeSelected() || !probeManualRcsControlKeys.has(event.code)) return;
        const editingFormField = event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement || (event.target instanceof HTMLInputElement && event.target !== probeManualRcsInput);
        if (editingFormField) return;
        event.preventDefault(); probeManualRcsKeys.add(event.code); updateProbeManualRcsUI();
    });
    window.addEventListener("keyup", (event) => { if (probeManualRcsKeys.delete(event.code)) updateProbeManualRcsUI(); });
    window.addEventListener("blur", () => { if (probeManualRcsKeys.size > 0) { probeManualRcsKeys.clear(); updateProbeManualRcsUI(); } });
    window.addEventListener("resize", () => [protocolModal, telemetryModal, physicsModal, shipModal, towerModal, terraMapModal].forEach(clampModalPosition));
    startBtn.addEventListener("click", () => {
        if ((started && !s.end) || launchCountdownTimer !== null) return;
        const countdownSeconds = Math.max(0, Math.min(60, Number(launchCountdownInput.value) || 0));
        if (countdownSeconds === 0) { beginMissionAfterCountdown(); return; }
        launchCountdownEndsAt = performance.now() + countdownSeconds * 1000;
        launchCountdownInput.disabled = true; startBtn.disabled = true; updateProbeDockingUI(); updateLaunchCountdownButton();
        launchCountdownTimer = window.setTimeout(beginMissionAfterCountdown, countdownSeconds * 1000);
    });
    pauseBtn.addEventListener("click", () => { if (started && !s.end) paused = !paused; });
    exportBtn.addEventListener("click", exportTelemetry);
    falseTowerAuthBtn.addEventListener("click", () => {
        if (!isLinkedMode()) return;
        falseTowerAuthorizationActive = !falseTowerAuthorizationActive; updateFalseTowerAuthUI(); refreshPlatformState(0);
        if (sensors?.platformLink) setSensorValue(sensors.platformLink, samplePlatformLink());
        updateCaptureStatus();
    });
    toggleShipControllersBtn.addEventListener("click", () => {
        shipControllersSection.hidden = !shipControllersSection.hidden;
        toggleShipControllersBtn.textContent = shipControllersSection.hidden ? "Abrir controladores" : "Ocultar controladores";
        if (!shipControllersSection.hidden) updateShipGainPanel();
    });
    resetShipGainsBtn.addEventListener("click", () => { const controller = getSelectedShipController(); if (controller) { controller.resetControlGains(); updateShipGainPanel(); } });
    resetTargetBtn.addEventListener("click", () => setLandingTarget(0));
    openTerraMapBtn.addEventListener("click", () => { probeMapControls.hidden = !isProbeSelected(); updateProbeManualRcsUI(); updateProbeDockingUI(); terraMapView.setState(getTerraMapState()); updateVehicleTrajectoryPredictions(); });
    setProbePositionBtn.addEventListener("click", () => setProbePosition(probeConfig.x));
    simulateProbeTrajectoryBtn.addEventListener("click", simulateProbeTrajectory);
    positionProbePairBtn.addEventListener("click", positionProbePair);
    probeManualRcsInput.addEventListener("change", updateProbeManualRcsUI);
    initialFlightTimeInput.addEventListener("input", () => scene.setInitialStarbaseTime(initialFlightTimeInput.value));
    focusStarbaseBtn.addEventListener("click", () => { sceneFocusX = STANDALONE_LAUNCH_WORLD_X; });
    [operationModeSelect, shipSelect, platformSelect, shipFeedbackModeSelect, boosterRecoverySelect, flightProgramProfileSelect, flightProgramAltitudeInput, flightProgramHotstageAltitudeInput, flightProgramHotstageThrottleInput, flightProgramHotstageRampInput, flightProgramHotstagePitchBiasInput, flightProgramHotstageReserveInput, flightProgramBoosterThrottleInput, flightProgramBoosterFlipAngleInput, flightProgramBoosterInboundVelocityInput, flightProgramBoosterBurnDurationInput, flightProgramBoosterRecoveryThrustInput, flightProgramHoldInput, flightProgramPostHoldSelect].forEach((input) => input.addEventListener("change", syncOperationMode));
    superHeavyAttachS24Input.addEventListener("change", () => {
        if (started || !isSuperHeavySelected()) return;
        stackMission.attachS24 = superHeavyAttachS24Input.checked;
        if (stackMission.attachS24 && flightControlState.flightProgramProfile !== FLIGHT_PROGRAM_PROFILES.STACK_HOTSTAGE_BOOSTBACK && flightControlState.flightProgramProfile !== FLIGHT_PROGRAM_PROFILES.SUBORBITAL_MISSION) {
            flightControlState.flightProgramProfile = FLIGHT_PROGRAM_PROFILES.STACK_HOTSTAGE_BOOSTBACK; flightProgramProfileSelect.value = flightControlState.flightProgramProfile;
        }
        stackMission.separated = false; stackMission.boosterRecovery = null; stackMission.boostbackReturn = false;
        resetWaitingState(); updateSuperHeavyStackPanel(); updateFlightProgramStatus(); persistFlightControlConfig();
    });
    runHotstageOptimizationBtn.addEventListener("click", () => runHotstageOptimization().catch((error) => { hotstageOptimizationStatus.textContent = `Falha no ensaio: ${error.message}`; runHotstageOptimizationBtn.disabled = false; }));
    applyHotstageOptimizationBtn.addEventListener("click", applyBestHotstageOptimization);
    runBoosterOptimizationBtn.addEventListener("click", () => runBoosterOptimization().catch((error) => { boosterOptimizationStatus.textContent = `Falha no ensaio B7: ${error.message}`; runBoosterOptimizationBtn.disabled = false; }));
    applyBoosterOptimizationBtn.addEventListener("click", applyBestBoosterOptimization);
    toggleFlightRouteBtn.addEventListener("click", () => { flightControlState.routeLocked = !flightControlState.routeLocked; syncOperationMode(); });
    abortBellyBtn.addEventListener("click", () => {
        if (!isLinkedMode() || !flightControlState.routeLocked) return;
        flightControlState.abortBelly = true; abortBellyBtn.textContent = "Abort Belly enviado"; syncFlightControllerConfig(); refreshPlatformState(0);
        if (sensors?.platformLink) setSensorValue(sensors.platformLink, samplePlatformLink());
        abortBellyBtn.textContent = samplePlatformLink().abortBelly === true ? "Abort Belly confirmado no link" : "Abort Belly aguardando enlace";
    });
    toggleFlightControlDetailsBtn.addEventListener("click", () => setFlightControlDetailsVisible(flightControlDetails.hidden));
    [towerLinkFailureSelect, towerArmsFailureSelect].forEach((input) => input.addEventListener("change", syncTowerFailurePanel));
    [towerApproachDistanceInput, towerApproachAngleInput, towerApproachToleranceInput].forEach((input) => {
        const sync = () => { readTowerApproachConfig(); refreshPlatformState(0); };
        input.addEventListener("input", sync);
        input.addEventListener("change", () => { sync(); towerApproachDistanceInput.value = String(towerApproachConfig.distance); towerApproachAngleInput.value = String(towerApproachConfig.angleDeg); towerApproachToleranceInput.value = String(towerApproachConfig.tolerance); });
    });
    [engineFailureSelect, rcsFailureSelect, flapFailureSelect].forEach((input) => input.addEventListener("change", syncFailurePanel));
    shipControlLoopView.addEventListener("input", (event) => { if (event.target instanceof HTMLInputElement && event.target.dataset.gainKey) handleShipGainInput(event.target, false); });
    shipControlLoopView.addEventListener("change", (event) => { if (event.target instanceof HTMLInputElement && event.target.dataset.gainKey) handleShipGainInput(event.target, true); });
    windXSlider.addEventListener("input", () => { environment.setWind({ x: Number(windXSlider.value) }); windXLabel.textContent = environment.wind.x; markPhysicsCustom(); });
    windZSlider.addEventListener("input", () => { environment.setWind({ z: Number(windZSlider.value) }); windZLabel.textContent = environment.wind.z; markPhysicsCustom(); });
    sn15PropulsionInputs.forEach((input) => input.addEventListener("change", applySn15PropulsionPanelValues));
    physicsPresetSelect.addEventListener("change", () => applyPhysicsPreset(physicsPresetSelect.value));
    protocolUplinkOverrideEnabled.addEventListener("change", refreshProtocolTransport);
    protocolDownlinkOverrideEnabled.addEventListener("change", refreshProtocolTransport);
    protocolUplinkOverrideText.addEventListener("input", refreshProtocolTransport);
    protocolDownlinkOverrideText.addEventListener("input", refreshProtocolTransport);
    protocolUplinkSignalSelect.addEventListener("change", () => updateProtocolSignalInputHint("uplink"));
    protocolDownlinkSignalSelect.addEventListener("change", () => updateProtocolSignalInputHint("downlink"));
    forceProtocolUplinkSignalBtn.addEventListener("click", () => applySingleProtocolSignalOverride("uplink"));
    forceProtocolDownlinkSignalBtn.addEventListener("click", () => applySingleProtocolSignalOverride("downlink"));
    clearProtocolUplinkOverrideBtn.addEventListener("click", () => clearProtocolOverride("uplink"));
    clearProtocolDownlinkOverrideBtn.addEventListener("click", () => clearProtocolOverride("downlink"));
    loadProtocolUplinkBtn.addEventListener("click", () => { protocolUplinkOverrideText.value = JSON.stringify(protocolState.shipUplinkRaw, null, 2); protocolUplinkOverrideEnabled.checked = true; refreshProtocolTransport(); });
    loadProtocolDownlinkBtn.addEventListener("click", () => { protocolDownlinkOverrideText.value = JSON.stringify(protocolState.platformDownlinkRaw, null, 2); protocolDownlinkOverrideEnabled.checked = true; refreshProtocolTransport(); });
    timeScroll.addEventListener("input", () => { telemetryStore.setGraphOffset(timeScroll.value); graphOffset = telemetryStore.graphOffset; graphFollowingLive = telemetryStore.followingLive; });
    
    c.addEventListener("pointerdown", (event) => {
        const rect = c.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;
        
        // Controles em mobile (velocidade, start, instâncias)
        const isMobileViewport = mobileViewport.matches;
        if (isMobileViewport && telemetryHudStyle === "spacex" && window.mobileHudButtons) {
            const btnInfo = window.mobileHudButtons;
            
            // Botão de instâncias
            const instBtn = btnInfo.instances;
            if (instBtn && Math.hypot(pointerX - instBtn.x, pointerY - instBtn.y) <= instBtn.r) {
                instanceTracker.hidden = !instanceTracker.hidden;
                return;
            }
            
            // Botões de velocidade
            if (btnInfo.speeds) {
                for (const speedBtn of btnInfo.speeds) {
                    if (pointerX >= speedBtn.x && pointerX <= speedBtn.x + speedBtn.w &&
                        pointerY >= speedBtn.y && pointerY <= speedBtn.y + speedBtn.h) {
                        sim = speedBtn.multiplier;
                        updateSimulationSpeedUI();
                        return;
                    }
                }
            }
            
            // Botão START/PAUSE
            const startBtn = btnInfo.start;
            if (startBtn && pointerX >= startBtn.x && pointerX <= startBtn.x + startBtn.w &&
                pointerY >= startBtn.y && pointerY <= startBtn.y + startBtn.h) {
                if ((started && !s.end) || launchCountdownTimer !== null) return;
                const countdownSeconds = Math.max(0, Math.min(60, Number(launchCountdownInput.value) || 0));
                if (countdownSeconds === 0) { beginMissionAfterCountdown(); return; }
                launchCountdownEndsAt = performance.now() + countdownSeconds * 1000;
                launchCountdownInput.disabled = true; startBtn.disabled = true; updateProbeDockingUI(); updateLaunchCountdownButton();
                launchCountdownTimer = window.setTimeout(beginMissionAfterCountdown, countdownSeconds * 1000);
                return;
            }
        }
        
        selectStandaloneLandingTarget(event);
    });
    c.addEventListener("mousemove", (event) => {
        const rect = c.getBoundingClientRect(); 
        const pointerX = event.clientX - rect.left; 
        const pointerY = event.clientY - rect.top;
        
        // Cursor pointer if hovering mobile HUD buttons
        const isMobileViewport = mobileViewport.matches;
        if (isMobileViewport && telemetryHudStyle === "spacex" && window.mobileHudButtons) {
            const btnInfo = window.mobileHudButtons;
            
            // Instâncias button
            if (btnInfo.instances) {
                const instBtn = btnInfo.instances;
                if (Math.hypot(pointerX - instBtn.x, pointerY - instBtn.y) <= instBtn.r) {
                    c.style.cursor = "pointer";
                    return;
                }
            }
            
            // Speed buttons
            if (btnInfo.speeds) {
                for (const speedBtn of btnInfo.speeds) {
                    if (pointerX >= speedBtn.x && pointerX <= speedBtn.x + speedBtn.w &&
                        pointerY >= speedBtn.y && pointerY <= speedBtn.y + speedBtn.h) {
                        c.style.cursor = "pointer";
                        return;
                    }
                }
            }
            
            // Start button
            if (btnInfo.start) {
                const startBtn = btnInfo.start;
                if (pointerX >= startBtn.x && pointerX <= startBtn.x + startBtn.w &&
                    pointerY >= startBtn.y && pointerY <= startBtn.y + startBtn.h) {
                    c.style.cursor = "pointer";
                    return;
                }
            }
        }
        
        c.style.cursor = isFlightControlBuildingHit(pointerX, pointerY) ? "pointer" : isLinkedMode() ? "default" : "crosshair";
    });
})();
