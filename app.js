// (from: https://qiita.com/Evolutor_web/items/655c6402aece800fd081)
const getDevice = (function(){
    var ua = navigator.userAgent;
    if(ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0){
        return 'sp';
    } else if(ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0){
        return 'tab';
    } else {
        return 'other';
    }
})();

const signalToChar = {
    ".-"     : "a",
    "-..."   : "b",
    "-.-."   : "c",
    "-.."    : "d",
    "."      : "e",
    "..-."   : "f",
    "--."    : "g",
    "...."   : "h",
    ".."     : "i",
    ".---"   : "j",
    "-.-"    : "k",
    ".-.."   : "l",
    "--"     : "m",
    "-."     : "n",
    "---"    : "o",
    ".--."   : "p",
    "--.-"   : "q",
    ".-."    : "r",
    "..."    : "s",
    "-"      : "t",
    "..-"    : "u",
    "...-"   : "v",
    ".--"    : "w",
    "-..-"   : "x",
    "-.--"   : "y",
    "--.."   : "z",
    "-----"  : "0",
    ".----"  : "1",
    "..---"  : "2",
    "...--"  : "3",
    "....-"  : "4",
    "....."  : "5",
    "-...."  : "6",
    "--..."  : "7",
    "---.."  : "8",
    "----."  : "9",
    ".-.-.-" : ".",
    "--..--" : ",",
    "---..." : ":",
    "..--.." : "?",
    ".----." : "'",
    "-....-" : "-",
    "-..-."  : "/",
    "-.--.-" : "(",
    //            "-.--.-" : ")",
    ".-..-." : "\"",
    ".--.-." : "@",
    "-...-"  : "=",
    "-.-.--" : "!"
}

angular.module('morseApp', [])
    .controller('morseCtrl', ['$scope', '$timeout', ($scope, $timeout) => {
        $scope.shortThreshold  = 120;
        $scope.longThreshold   = 1000;
        $scope.letterThreshold = 500;
        $scope.wordThreshold   = 1000;
        $scope.signal = "";
        $scope.input  = "";
        $scope.isKeyDowning = false;
        $scope.isPussing = false;
        $scope.shortMilliLogs = [];
        $scope.longMilliLogs = [];
        $scope.latestMilli = null;
        $scope.isTouchMode = getDevice != "other";
        $scope.isDebugMode = false;
        $scope.enableWordThreshold = true;
        $scope.debugLogs = [];

        let letterTimeoutId = null;
        let wordTimeoutId   = null;
        
        let startDate = new Date();
        
        $scope.mouseup = (e) => {
            console.log('mouse up');
            $scope.debugLogs.push(`mouse up: ${e}`);
            
            $scope.isPussing = false;
            const passedMilli = new Date() - startDate;
            console.log(passedMilli);

            // Update the latest milli
            $scope.latestMilli = passedMilli;

            if (passedMilli <= $scope.shortThreshold){
                $scope.signal += '.';
                $scope.shortMilliLogs.push(passedMilli);
            } else if (passedMilli <= $scope.longThreshold) {
                $scope.signal += '-';
                $scope.longMilliLogs.push(passedMilli);
            }

            letterTimeoutId = $timeout(() => {
                console.log('WORD END!');
                $scope.debugLogs.push("world end");                        
                if ($scope.signal in signalToChar){
                    $scope.input += signalToChar[$scope.signal];
                } else if ($scope.signal != ""){                            
                    $scope.input += "[?]"
                }
                
                letterTimeoutId = null;
                $scope.signal = "";

                if ($scope.enableWordThreshold){
                    wordTimeoutId = $timeout(() => {
                        // Add space
                        $scope.input += " ";
                        wordTimeoutId = null;
                    }, $scope.wordThreshold)
                }

            }, $scope.letterThreshold)

        };

        $scope.mousedown = (e) => {
            console.log(`mouse down: ${e}`);
            $scope.debugLogs.push(`mouse down: ${e}`);
            startDate = new Date();
            $scope.isPussing = true;

            if (letterTimeoutId != null) {
                $timeout.cancel(letterTimeoutId)
            }

            if (wordTimeoutId != null) {
                $timeout.cancel(wordTimeoutId)
            }

        };

        // $scope.morseSignal = () => {
        //     return $scope.signals.join('')
        // };

        $scope.clearInput = () => {
            $scope.input = "";
        }

        $scope.shortMilliAvg = () => {
            const len = $scope.shortMilliLogs.length;
            return $scope.shortMilliLogs.reduce(function(s, e){return s + e}, 0) / len;
        }

        $scope.longMilliAvg = () => {
            const len = $scope.longMilliLogs.length;
            return $scope.longMilliLogs.reduce(function(s, e){return s + e}, 0) / len;
        }

        // (from: https://css-tricks.com/snippets/javascript/javascript-keycodes/)
        document.addEventListener("keydown", (event) => {
            if(event.which == 32){
                console.log("space down");
                if(!$scope.isKeyDowning){
                $scope.isKeyDowning = true;
                $scope.$apply(() => {
                    $scope.mousedown(event);                          
                });
                }
            }
        });

        document.addEventListener("keyup", (event) => {
            if(event.which == 32){
                console.log("space up");
                $scope.isKeyDowning = false;
                $scope.$apply(() => {
                $scope.mouseup(event);                          
                });
            }
        })

    }])
    // (from: https://st40.xyz/one-run/article/116/)
    .directive('myTouchstart', [function() {
        return function(scope, element, attr) {
    
            element.on('touchstart', function(event) {
                scope.$apply(function() { 
                    scope.$eval(attr.myTouchstart); 
                });
            });
        };
    }]).directive('myTouchend', [function() {
        return function(scope, element, attr) {
    
            element.on('touchend', function(event) {
                scope.$apply(function() { 
                    scope.$eval(attr.myTouchend); 
                });
            });
        };
    }]);