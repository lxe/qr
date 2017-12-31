/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var errorElement = document.querySelector('#errorMsg');
var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var d = document.querySelector('div');

// Put variables in global scope to make them available to the browser console.
var constraints = {
  video: {
    facingMode: 'environment',
  },
  audio: false
}

function handleSuccess(stream) {
  var videoTracks = stream.getVideoTracks();

  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.oninactive = function () {
    console.log('Stream inactive');
  };

  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;

  video.addEventListener('play', () => {
    let w = canvas.width = video.clientWidth;
    let h = canvas.height = video.clientHeight;
    let ctx = canvas.getContext('2d');

    function step() {
      let decoded = undefined;
      ctx.drawImage(video, 0, 0, w, h);

      try {
        let imageData = ctx.getImageData(0, 0, w, h);
        // console.log(data.length);
        // console.log(w, h);
        decoded = jsQR.decodeQRFromImage(imageData.data, w, h);
        // console.log(decoded);
        // 
      } catch (e) {
        console.log(e);
        d.innerHTML = e.toString();
      }

      if (decoded && /^https?:\/\//.test(decoded)) {
        video.style.display = 'none';
        canvas.style.display = 'block';
        canvas.style.visibility = 'visible';
        d.innerHTML = decoded;

        setTimeout(() => {
          window.location.href = decoded;
        }, 1000);

        return;
      }

      requestAnimationFrame(step);   
    };

    requestAnimationFrame(step);
  }, false);
}

function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
      constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
}

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

navigator.mediaDevices.getUserMedia(constraints).
  then(handleSuccess).catch(handleError);