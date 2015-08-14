var CommandFactory = require("../../lib/command/CommandFactory");
var CommandMetricsFactory = require("../../lib/metrics/CommandMetrics").Factory;
var CircuitBreakerFactory = require("../../lib/command/CircuitBreaker");

describe("CommandFactory", function() {
    beforeEach(function() {
        CommandFactory.resetCache();
        CommandMetricsFactory.resetCache();
    });

    it("should use the defaults set in HystrixConfig", function() {
        var command = CommandFactory.getOrCreate("TestConfig").build();
        expect(command.timeout).toBe(30000);

        var metrics = CommandMetricsFactory.getOrCreate({commandKey:"TestConfig"});
        expect(metrics.rollingCount.windowLength).toBe(10000);
        expect(metrics.rollingCount.numberOfBuckets).toBe(10);
        expect(metrics.percentileCount.windowLength).toBe(10000);
        expect(metrics.percentileCount.numberOfBuckets).toBe(10);

        var cb = CircuitBreakerFactory.getOrCreate({commandKey: "TestConfig"});
        expect(cb.circuitBreakerSleepWindowInMilliseconds).toBe(3000);
        expect(cb.circuitBreakerErrorThresholdPercentage).toBe(50);
        expect(cb.circuitBreakerForceClosed).toBeFalsy();
        expect(cb.circuitBreakerForceOpened).toBeFalsy();
        expect(cb.circuitBreakerRequestVolumeThresholdValue).toBe(10);
    });

    it("should override the defaults set in builder", function() {
        var command = CommandFactory
            .getOrCreate("TestCustomConfig")
            .timeout(3000)
            .statisticalWindowLength(10)
            .statisticalWindowNumberOfBuckets(1)
            .percentileWindowLength(20)
            .percentileWindowNumberOfBuckets(2)
            .circuitBreakerErrorThresholdPercentage(60)
            .circuitBreakerForceClosed(true)
            .circuitBreakerForceOpened(true)
            .circuitBreakerRequestVolumeThreshold(40)
            .circuitBreakerSleepWindowInMilliseconds(1000)
            .build();
        expect(command.timeout).toBe(3000);

        var metrics = CommandMetricsFactory.getOrCreate({commandKey:"TestCustomConfig"});
        expect(metrics.rollingCount.windowLength).toBe(10);
        expect(metrics.rollingCount.numberOfBuckets).toBe(1);
        expect(metrics.percentileCount.windowLength).toBe(20);
        expect(metrics.percentileCount.numberOfBuckets).toBe(2);

        var cb = CircuitBreakerFactory.getOrCreate({commandKey: "TestCustomConfig"});
        expect(cb.circuitBreakerSleepWindowInMilliseconds).toBe(1000);
        expect(cb.circuitBreakerErrorThresholdPercentage).toBe(60);
        expect(cb.circuitBreakerForceClosed).toBeTruthy();
        expect(cb.circuitBreakerForceOpened).toBeTruthy();
        expect(cb.circuitBreakerRequestVolumeThresholdValue).toBe(40);
    })

});