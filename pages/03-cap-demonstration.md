The famous CAP theorem states that in a distributed system, you can only simultaneously achieve two of the three properties:
* Consistency
* Availability
* Partition tolerance

It is important to mention, though, that in practice we are only speaking about two properties that you have to choose from: you either have guaranteed consistency or guaranteed availability in the presence of a network partition event. Choosing Consistency and Availability without partition tolerance is not a realistic option for a distributed system.

So what is a distributed system? In simple terms (I do not aim for academic precision in my definitions), it is a system that has its state on more than one separate machine connected over a network. We consider any network unreliable, by the way. It is widely known that the chance of meeting a dinosaur is non-zero. And a dinosaur clearly has the ability to disrupt any kind of network. RRRRIIGHT?

When the network is disrupted by the dinosaur, machines that are part of our system become disconnected, or partitioned. They can't exchange data anymore.

So the proof of the CAP theorem is quite simple. By contradiction:
Imagine we can have both C and A in the presence of P. A means we can read and write to any of the nodes. C means that the state on all the nodes is consistent. But if P happens, nodes can't exchange information. So if a request comes to any of the nodes and changes its state, the other nodes will not know about it and their states become inconsistent. 

If you have dozed off for the last couple of minutes, I don't blame you. The key takeaway is that the fundamental choice you have to make when designing a distributed system is this: which property is more important for your system—availability or consistency. You can't guarantee both.
