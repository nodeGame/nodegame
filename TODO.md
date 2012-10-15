# NODEGAME TODO LIST
---

* documentation
* window.loadFrame() can cache the frame. It could be possible to cache the original HTML as loaded the first time, or the final HTML as before updating the state
* create a STEPDONE event. There should be a difference between STATEDONE and STEPDONE, also STEPDONE could be unsichronized 

---
# IMPORTANT

* when pushing to heroku do not define ports when instantiating a new server

* concatinated nodegame.js file for server needs to be added to the repo or we need to use heroku specific hooks
-> since heroku does not allow us to write to their filesystem


