(function () {
    const DEFAULT_CAPTURE_ENVELOPE = Object.freeze({
        captureMarginX: 2,
        captureMarginZ: 5,
        captureRateLimitX: 2.2,
        captureRateLimitZ: 1.9,
        captureAngleLimit: 0.1,
        armBreakImpactSpeed: 10,
        contactModel: Object.freeze({
            mastHalfWidth: 8,
            armGapHalfOpen: 21,
            armGapHalfClosed: 7.5,
            armSpan: 15,
            supportBandHalfHeight: 12,
            armThickness: 3.2,
            clawDepth: 4.2,
            clawHalfHeight: 5,
            mastClearanceHalfHeight: 28,
            sideBounce: 0.08,
            sideFriction: 0.82,
            verticalDamping: 7.5,
            lateralDamping: 6.5,
            angularDamping: 7.2,
            attitudeDamping: 5.8,
            holdDamping: 12,
        }),
    });

    /** Immutable definition of a capture platform and its physical envelope. */
    class PlatformDefinition {
        constructor({ id, label, platformClass, recoveryType, visual, captureHeight, towerHeight, envelope }) {
            this.id = id;
            this.label = label;
            this.platformClass = platformClass;
            this.recoveryType = recoveryType;
            this.visual = visual;
            this.captureHeight = captureHeight;
            this.towerHeight = towerHeight;
            this.captureMarginX = envelope.captureMarginX;
            this.captureMarginZ = envelope.captureMarginZ;
            this.captureRateLimitX = envelope.captureRateLimitX;
            this.captureRateLimitZ = envelope.captureRateLimitZ;
            this.captureAngleLimit = envelope.captureAngleLimit;
            this.armBreakImpactSpeed = envelope.armBreakImpactSpeed;
            this.contactModel = Object.freeze({ ...envelope.contactModel });
            Object.freeze(this);
        }

        createController() {
            return new window.MecazillaController({
                captureHeight: this.captureHeight,
                towerHeight: this.towerHeight,
                captureMarginX: this.captureMarginX,
                captureMarginZ: this.captureMarginZ,
                armBreakImpactSpeed: this.armBreakImpactSpeed,
            });
        }
    }

    function createRegistry({ captureAltitude, towerHeight }) {
        const tower = (spec) => new PlatformDefinition({
            ...spec,
            platformClass: "catch_tower",
            recoveryType: "capture",
            visual: "tower",
            envelope: DEFAULT_CAPTURE_ENVELOPE,
        });

        return Object.freeze({
            mecazilla_olp_a: tower({
                id: "mecazilla_olp_a",
                label: "Mecazilla OLP-A",
                captureHeight: captureAltitude,
                towerHeight,
            }),
            mecazilla_olp_b: tower({
                id: "mecazilla_olp_b",
                label: "Mecazilla OLP-B",
                captureHeight: captureAltitude + 4,
                towerHeight: towerHeight + 5,
            }),
            mecazilla_teststand: tower({
                id: "mecazilla_teststand",
                label: "Mecazilla Test Stand",
                captureHeight: captureAltitude - 12,
                towerHeight: towerHeight - 18,
            }),
        });
    }

    window.StarshipPlatformCatalog = Object.freeze({
        PlatformDefinition,
        createRegistry,
        defaultCaptureEnvelope: DEFAULT_CAPTURE_ENVELOPE,
    });
})();
