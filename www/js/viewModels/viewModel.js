define([
    'lib/knockout',
    'lib/lodash'
], function (ko, _) {
    'use strict';

    /**
     * Base ViewModel class that includes mechanisms
     * for creating computed observables & subViews
     * that can easily be disposed of when the view model
     * is no longer needed.
     *
     * Because of the way ViewModel tracks computed values
     * and sub-views to be disposed of, it should not be used
     * as a class prototype. Prefer a non-prototypical
     * inheritance/extension strategy when creating specific
     * views.
     *
     * @exports viewModels/ViewModel
     */
    var ViewModel = function () {
        var
            computedValues = [],
            subscriptions = [],
            subViews = [],
            self = this;

        /**
         * Creates a new computed value that will be disposed
         * of when the dispose method is called on the view model.
         * Otherwise, this works like the standard ko.computed
         */
        self.computed = function () {
            var computed = ko.computed.apply(ko, arguments);
            computedValues.push(computed);
            return computed;
        };

        self.subscribe = function (observable /* callback, option1, option2... */) {
            if (!ko.isObservable(observable)) {
                throw new Error("Subscribe only applies to observables");
            }

            var args = Array.prototype.slice.call(arguments, 1);
            var subscription = observable.subscribe.apply(observable, args);
            subscriptions.push(subscription);
            return subscription;
        };

        /**
         * Creates and returns a new view from the provided constructor.
         * Subsequent arguments are passed to the constructor when the
         * subView is created. The subView is also registered for cleanup
         * when dispose is called.
         */
        self.subView = function (subViewConstructor /* arg1, arg2... */) {
            /*
             * Calls bind to create a proxy constructor that's partially applyed with all arguments
             * to subView. Equivalent to:
             * subViewConstructor.bind(subViewConstructor, arg1, arg2...);
             */
            var ProxyConstructor = subViewConstructor.bind.apply(subViewConstructor, arguments);

            /*
             * Instantiates a new subView. The bind call above incorrectly binds 'this' to
             * subViewConstructor, but the use of 'new' below overrides that when calling
             * the proxy constructor.
             */
            var subView = new ProxyConstructor();

            subViews.push(subView);
            return subView;
        };

        /**
         * Informs the ViewModel that it's being disposed of
         * and that it should take any actions needed to clean
         * up. Specifically, it disposes of any computed
         * observables and calls onDispose if it has been
         * defined.
         */
        self.dispose = function () {
            // Call dispose callbacks
            if (_.isFunction(this.onDispose)) {
                this.onDispose.apply(self, arguments);
            }

            // Cleanup computed values
            _.each(computedValues, function (computedValue) {
                computedValue.dispose();
            });
            computedValues = [];

            // Cleanup subscriptions
            _.each(subscriptions, function (subscription) {
                subscription.dispose();
            });
            subscriptions = [];

            // Recurse to any associated view models
            _.each(subViews, function (subView) {
                subView.dispose();
            });
            subViews = [];
        };

        /**
         * Disposes a specific subView and removes it from the
         * list of subviews.  This should be used if a subView
         * needs to be disposed of before the parent view itself
         * is disposed.
         */
        self.disposeSubView = function(subView) {
            var index = subViews.indexOf(subView);
            if(index == -1 || !_.isFunction(subView.dispose)) {
                return;
            }
            subViews.splice(index, 1);
            subView.dispose();
        };
    };


    // Generic function that extends types - we could put
    // this in a library if we ever want to re-use it.
    var extend = function (Parent, init, passArgsToParent) {
        var Constructor = function () {
            //ParentWithArgs workaround is necessary because the new operator can't be used directly with .apply
            //(http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible)
            function ParentWithArgs(args) {
                return Parent.apply(this, args);
            }
            ParentWithArgs.prototype = Parent.prototype;

            var base = passArgsToParent ?
                new ParentWithArgs(arguments):
                new Parent();
            init.apply(base, arguments);
            return base;
        };

        Constructor.extend = extend.bind({}, Constructor);

        return Constructor;
    };

    //Setting up a root type to support extension
    ViewModel.extend = extend.bind({}, ViewModel);

    return ViewModel;
});