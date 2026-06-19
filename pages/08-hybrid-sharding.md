In fintech, consistency is non-negotiable. Protecting user balances and order execution correctness is paramount, even if it degrades system availability.

We use a hybrid sharding pattern: user wallets are isolated on separate shards (allowing high availability for balances), but shared order books are where all users meet to trade (requiring strict consistency).

To prevent duplicates and ensure message ordering, we use sequence numbers. If a gap is detected, the receiver halts immediately. Automatic recovery is incredibly complex due to system heterogeneity, so manual intervention is preferred to protect funds. However, in some trading environments, alerting and isolated manual resolution might be preferred over halting the entire system.
