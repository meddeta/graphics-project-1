Assignment 1

Group Members:

Alessandro Genovese


Melika Sherafat 



Completed Elements (All have been completed):
(a) You have to use real time to synchronize your animations. (2 Marks).
The TIME variable was used when dealing with animation.

(b) Ground box, 2 (Marks).
The ground box was created using translations and scaling transformation.

(c) Two rocks (spheres), (4 Marks).
The two rocks were created using spheres and scaling transformations.

(d) Seaweed modeling: each strand has 10 ellipses. (4 Marks)
(e) Seaweed animation (4 Marks).
The seaweed was created using a recursive function. Each ellipse was created
and transformed using a recursive function call. At the end of each recursive call
is a gPop to ensure that the modelMatrix would be returned to its previous state.

(f) Seaweed positioning (3 strands) (3 Marks).
The seaweed was positioned using translations. A single seaweed render was
encapsulated in a function call to make it easy to draw multiple strands. The seaweed
was implemented as a hierarchical model, with individual rotation controlled by
sinusoidal functions.

(g) Fish modeling: 2 eyes with pupils, 1 head, 1 body, 2 tail fins, (6 Marks).
Fish modelling was done using a series of translations, scalings and rotations.

(h) Fish animation: The fish must swim in a circle around the seaweed. It should
always be aligned with the tangent of the circle. (4 Marks).
Fish animation was done using a rotation centered around the seaweed, as well as
a vertical displacement set by a sinusoidal function.

(i) A burst of 4-5 bubbles should appear every few seconds. (4 Marks).
(j) Each bubble should appear near the mouth of the character (2 Marks).
(k) The shape of each bubble should oscillate with time. (2 Marks).
(l) Each bubble should move straight up with time. (2 Marks).
(m) Each bubble should be removed/deleted after approximately 12 seconds. (1
Mark).
Bubbles were given a special class Bubble to encapsulate the rendering method,
as well as provide additional helper methods. Each bubble keeps track of its 
creation time to help implement deletion after 12 seconds.

(n) Model a human character with no arms. (4 Marks).
The character was modelled using a series of scaling, rotation and translation commands.

(o) The character should move in the x and y world directions. (2 Marks).
This movement was implemented using a sinusoidal function to compute x/y displacement, 
along with a translation.

(p) The legs of the character should kick (hips, knees) as shown in the video. (4
Marks). The feet do not move.
The kicking was done using a series of rotations (and following a simple hierarchical system model).

(q) You do not have to match the exact motion or dimensions of the objects shown in
the sample executable. However, your scene and the sample one should be
qualitatively and visually similar (4 Marks).
(r) Programming style (comments, functions) (2 Marks).
