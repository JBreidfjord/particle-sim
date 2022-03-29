# %%
import math

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.optimize import curve_fit


# %%
def comps(n, g):
    base = (n * (g ** 2)) + (g ** 2)
    best_1 = round(base + (n ** 2 / g ** 2))
    best_16 = round(base + ((n ** 2 / g ** 2) * 16))
    return best_1, best_16


def find_best(n, return_df=False):
    df = pd.DataFrame(columns=["best (1)", "best (16)"], dtype=int)
    for g in range(1, math.ceil(math.sqrt(n)) + 100):
        df.loc[g] = comps(n, g)
    df["avg"] = df.mean(axis=1)
    if return_df:
        return df
    return df["avg"].idxmin()


def find_line():
    low_range = np.array([[n, find_best(n)] for n in range(2, 1000)])
    high_range = np.array([[n, find_best(n)] for n in range(1000, 10000, 100)])
    return np.concatenate((low_range, high_range))


# %%
n = 1000
df = find_best(n, return_df=True)
print(df)
print("Current:", math.ceil(math.sqrt(n)))
print("Calculated (deg 1):", (1.50478571e-03 * n) + 5.20041608)
print("Calculated (deg 2):", (-2.03480284e-07 * n ** 2) + (3.13657600e-03 * n) + 4.45486443)
print(
    "Calculated (deg 3):",
    (4.09570571e-11 * n ** 3) + (-7.56862212e-07 * n ** 2) + (4.87629916e-03 * n) + 4.17145722,
)
print("Calculated (log):", math.log(n, 1.6572725) - 3.89293267)
print("Best:", df["avg"].idxmin())

# %%
arr = find_line()
# %%
x = arr[:, 0]
y = arr[:, 1]
print(np.polyfit(x, y, 1))
print(np.polyfit(x, y, 2))
print(np.polyfit(x, y, 3))
# %%
plt.plot(x, y)
plt.show()
# %%
def fit_func(xs, a, b):
    return [math.log(x, a) + b for x in xs]


curve_fit(fit_func, x, y, bounds=([1, -np.inf], [10, np.inf]))

# %%
