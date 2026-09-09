package com.algorithmviz.config;

import com.algorithmviz.entity.Problem;
import com.algorithmviz.entity.ProblemCategory;
import com.algorithmviz.entity.ProblemSolution;
import com.algorithmviz.repository.ProblemCategoryRepository;
import com.algorithmviz.repository.ProblemRepository;
import com.algorithmviz.repository.ProblemSolutionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 种子数据：项目首次启动时自动灌入 Hot 100 首批题目（20 道）。
 * 判断依据：problem 表为空才执行，重复启动不会重复插入。
 * 题面均为自行整理，不搬运力扣原文。
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ProblemCategoryRepository categoryRepository;
    private final ProblemRepository problemRepository;
    private final ProblemSolutionRepository solutionRepository;

    private final Map<String, ProblemCategory> categoryMap = new LinkedHashMap<>();
    private int problemOrder = 1;

    public DataSeeder(ProblemCategoryRepository categoryRepository,
                      ProblemRepository problemRepository,
                      ProblemSolutionRepository solutionRepository) {
        this.categoryRepository = categoryRepository;
        this.problemRepository = problemRepository;
        this.solutionRepository = solutionRepository;
    }

    @Override
    public void run(String... args) {
        if (problemRepository.count() > 0) {
            return;
        }
        seedCategories();
        seedProblems();
        System.out.println("[DataSeeder] Hot 100 种子数据灌入完成："
                + categoryMap.size() + " 个分类，" + problemRepository.count() + " 道题目");
    }

    private void seedCategories() {
        String[][] cats = {
                {"数组与哈希", "array-hash", "Hash"},
                {"双指针", "two-pointers", "CallSplit"},
                {"栈", "stack", "Layers"},
                {"链表", "linked-list", "Link"},
                {"二分查找", "binary-search", "Search"},
                {"树", "tree", "AccountTree"},
                {"图", "graph", "Hub"},
                {"动态规划", "dp", "Timeline"},
                {"回溯", "backtracking", "Replay"},
        };
        int order = 1;
        for (String[] c : cats) {
            ProblemCategory cat = new ProblemCategory();
            cat.setName(c[0]);
            cat.setSlug(c[1]);
            cat.setIcon(c[2]);
            cat.setOrderIndex(order++);
            categoryRepository.save(cat);
            categoryMap.put(c[1], cat);
        }
    }

    private Problem problem(String slug, String title, String difficulty, String catSlug,
                            String tags, String visualizer, String timeCx, String spaceCx,
                            String description) {
        Problem p = new Problem();
        p.setSlug(slug);
        p.setTitle(title);
        p.setDifficulty(difficulty);
        p.setCategory(categoryMap.get(catSlug));
        p.setTags(tags);
        p.setVisualizerType(visualizer);
        p.setTimeComplexity(timeCx);
        p.setSpaceComplexity(spaceCx);
        p.setDescription(description);
        p.setOrderIndex(problemOrder++);
        return problemRepository.save(p);
    }

    private void solution(Problem p, String name, String desc, String code, String tcx, String scx) {
        ProblemSolution s = new ProblemSolution();
        s.setProblem(p);
        s.setApproachName(name);
        s.setDescription(desc);
        s.setCode(code);
        s.setTimeComplexity(tcx);
        s.setSpaceComplexity(scx);
        s.setOrderIndex(1);
        solutionRepository.save(s);
    }

    private void seedProblems() {
        // ================= 数组与哈希 =================
        Problem p1 = problem("two-sum", "两数之和", "EASY", "array-hash",
                "数组,哈希表", null, "O(n)", "O(n)",
                """
                在一个整数数组里找出两个不同的数，使它们的和恰好等于目标值 target，返回这两个数的下标。
                题目保证恰好存在一组答案。
                示例：nums = [2, 7, 11, 15]，target = 9，输出 [0, 1]（2 + 7 = 9）。
                约束：2 <= nums.length <= 10^4，每个元素和 target 的范围是 -10^9 ~ 10^9。""");

        solution(p1, "哈希表一次遍历", """
                暴力做法是两重循环枚举所有配对，时间 O(n^2)。
                更快的思路：遍历数组时，对每个数 x 都问一句——"我需要的另一半 target - x 之前出现过吗？"
                用哈希表把"数值 -> 下标"存起来，查询只需 O(1)，整个过程一遍扫完。""", """
                public int[] twoSum(int[] nums, int target) {
                    Map<Integer, Integer> seen = new HashMap<>(); // 数值 -> 下标
                    for (int i = 0; i < nums.length; i++) {
                        int need = target - nums[i];
                        if (seen.containsKey(need)) {
                            return new int[]{seen.get(need), i};
                        }
                        seen.put(nums[i], i);
                    }
                    return new int[0]; // 题目保证有解，不会走到这里
                }""", "O(n)", "O(n)");

        // ================= 双指针 =================
        Problem p2 = problem("valid-palindrome", "验证回文串", "EASY", "two-pointers",
                "双指针,字符串", null, "O(n)", "O(1)",
                """
                判断一个字符串去掉所有非字母数字字符、并忽略大小写后，正着读和反着读是否一样。
                示例："A man, a plan, a canal: Panama" 处理后是 "amanaplanacanalpanama"，是回文。
                约束：字符串长度至少为 1，只包含可打印 ASCII 字符。""");

        solution(p2, "左右双指针相向而行", """
                一个指针从最左边出发，另一个从最右边出发，不断向中间靠拢。
                每次先跳过非字母数字的字符，然后比较两边字符（统一转小写），一旦不同就不是回文。
                两指针相遇还没发现不同，就是回文。""", """
                public boolean isPalindrome(String s) {
                    int left = 0, right = s.length() - 1;
                    while (left < right) {
                        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
                        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
                        if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                            return false;
                        }
                        left++;
                        right--;
                    }
                    return true;
                }""", "O(n)", "O(1)");

        // ================= 栈 =================
        Problem p3 = problem("valid-parentheses", "有效的括号", "EASY", "stack",
                "栈,字符串", "stack", "O(n)", "O(n)",
                """
                给一个只包含 ( ) [ ] { } 的字符串，判断括号是否全部正确闭合：
                每个左括号都必须被同类型的右括号闭合，且嵌套顺序正确。
                示例："()[]{}" 有效，"(]" 无效，"([)]" 无效。
                约束：字符串长度 >= 1。""");

        solution(p3, "栈配对", """
                括号匹配是栈最经典的应用：遇到左括号就压栈，遇到右括号就看栈顶——
                栈顶必须是与之配对的左括号，配对成功弹出，否则整个串无效。
                最后栈必须为空（还有剩说明左括号多了）。""", """
                public boolean isValid(String s) {
                    Deque<Character> stack = new ArrayDeque<>();
                    for (char c : s.toCharArray()) {
                        if (c == '(') stack.push(')');
                        else if (c == '[') stack.push(']');
                        else if (c == '{') stack.push('}');
                        else if (stack.isEmpty() || stack.pop() != c) return false;
                    }
                    return stack.isEmpty();
                }""", "O(n)", "O(n)");

        // ================= 链表 =================
        Problem p4 = problem("reverse-linked-list", "反转链表", "EASY", "linked-list",
                "链表", "linkedlist", "O(n)", "O(1)",
                """
                给定单链表的头节点，把整个链表反转，返回新的头节点。
                示例：1 -> 2 -> 3 -> 4 -> 5 反转后变成 5 -> 4 -> 3 -> 2 -> 1。
                约束：链表节点数范围 [0, 5000]，请分别尝试迭代和递归两种写法。""");

        solution(p4, "迭代三指针", """
                反转的核心动作只有一句话：把每个节点的 next 从"指向后面"改成"指向前面的那个"。
                用 prev 记录已反转部分的头，cur 是当前处理的节点，next 暂存后继防止断链。
                走完一遍后 prev 就是新头。""", """
                public ListNode reverseList(ListNode head) {
                    ListNode prev = null;
                    ListNode cur = head;
                    while (cur != null) {
                        ListNode next = cur.next; // 先存后继
                        cur.next = prev;          // 反转指针
                        prev = cur;               // prev 前进
                        cur = next;               // cur 前进
                    }
                    return prev;
                }""", "O(n)", "O(1)");

        Problem p5 = problem("merge-two-sorted-lists", "合并两个有序链表", "EASY", "linked-list",
                "链表,排序", "linkedlist", "O(n+m)", "O(1)",
                """
                把两个升序排列的链表合并成一个仍然升序的链表，节点必须复用原有的，不能新建节点值。
                示例：1 -> 2 -> 4 和 1 -> 3 -> 4 合并成 1 -> 1 -> 2 -> 3 -> 4 -> 4。""");

        solution(p5, "哑巴节点 + 逐个摘取", """
                想象两条已经排好队的队伍，每次比较两队排头，较小的一人出队接到结果后面。
                用一个"哑巴节点"（dummy）当结果的占位头，可以省掉"第一个节点没有前驱"的特判。
                某一条链走完后，把另一条剩下的整段直接接上。""", """
                public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
                    ListNode dummy = new ListNode(0);
                    ListNode tail = dummy;
                    while (l1 != null && l2 != null) {
                        if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
                        else                  { tail.next = l2; l2 = l2.next; }
                        tail = tail.next;
                    }
                    tail.next = (l1 != null) ? l1 : l2;
                    return dummy.next;
                }""", "O(n+m)", "O(1)");

        Problem p6 = problem("linked-list-cycle", "环形链表", "EASY", "linked-list",
                "链表,快慢指针", "linkedlist", "O(n)", "O(1)",
                """
                判断一个链表中是否存在环：某个节点的 next 指回了链表中它前面的某个节点，就会永远走不到头。
                进阶：能否只用 O(1) 的额外空间完成判断？""");

        solution(p6, "快慢指针（Floyd 判圈）", """
                让慢指针每次走 1 步、快指针每次走 2 步。
                如果没有环，快指针会先走到 null；如果有环，两人最终会在环里"套圈相遇"。
                就像两个运动员在操场跑圈，速度快的一定会追上慢的。""", """
                public boolean hasCycle(ListNode head) {
                    ListNode slow = head, fast = head;
                    while (fast != null && fast.next != null) {
                        slow = slow.next;
                        fast = fast.next.next;
                        if (slow == fast) return true;
                    }
                    return false;
                }""", "O(n)", "O(1)");

        // ================= 二分查找 =================
        Problem p7 = problem("binary-search", "二分查找", "EASY", "binary-search",
                "数组,二分", "search", "O(log n)", "O(1)",
                """
                在一个升序、元素互不相同的数组中找出目标值的下标，找不到返回 -1。
                示例：nums = [-1, 0, 3, 5, 9, 12]，target = 9，输出 4。
                约束：数组长度可达 10^4，要求时间复杂度必须是对数级别。""");

        solution(p7, "闭区间二分", """
                排好序的数组有个宝贵性质：看一眼中间元素就能排除掉一半。
                维护 [left, right] 闭区间，每次比较中点与目标：
                中点小了往右半边找，大了往左半边找，区间每次减半，直到找到或区间为空。""", """
                public int search(int[] nums, int target) {
                    int left = 0, right = nums.length - 1;
                    while (left <= right) {
                        int mid = left + (right - left) / 2; // 防溢出写法
                        if (nums[mid] == target) return mid;
                        else if (nums[mid] < target) left = mid + 1;
                        else right = mid - 1;
                    }
                    return -1;
                }""", "O(log n)", "O(1)");

        Problem p8 = problem("search-rotated-array", "搜索旋转排序数组", "MEDIUM", "binary-search",
                "数组,二分", "search", "O(log n)", "O(1)",
                """
                一个原本升序的数组在某个未知点被"旋转"了，例如 [0,1,2,4,5,6,7] 变成 [4,5,6,7,0,1,2]。
                在这个数组里找目标值的下标，找不到返回 -1。要求时间 O(log n)。
                示例：nums = [4,5,6,7,0,1,2]，target = 0，输出 4。""");

        solution(p8, "判断哪半边有序", """
                旋转后数组从中间切开，一定有一半是有序的，另一半包含旋转点。
                关键技巧：先判断左半段是否有序（nums[left] <= nums[mid]），
                然后看目标值是否落在有序的那一半范围内——在就丢弃另一半，不在就丢弃这有序的一半。
                每轮仍然排除一半，复杂度保持 O(log n)。""", """
                public int search(int[] nums, int target) {
                    int left = 0, right = nums.length - 1;
                    while (left <= right) {
                        int mid = left + (right - left) / 2;
                        if (nums[mid] == target) return mid;
                        if (nums[left] <= nums[mid]) {           // 左半段有序
                            if (nums[left] <= target && target < nums[mid]) right = mid - 1;
                            else left = mid + 1;
                        } else {                                  // 右半段有序
                            if (nums[mid] < target && target <= nums[right]) left = mid + 1;
                            else right = mid - 1;
                        }
                    }
                    return -1;
                }""", "O(log n)", "O(1)");

        // ================= 树 =================
        Problem p9 = problem("binary-tree-inorder", "二叉树的中序遍历", "EASY", "tree",
                "树,DFS", "binarytree", "O(n)", "O(h)",
                """
                给定二叉树根节点，按"左子树 -> 根 -> 右子树"的顺序返回所有节点的值。
                示例：树 [1,null,2,3] 的中序遍历是 [1, 3, 2]。
                递归写法很简单，进阶请尝试用显式栈实现迭代版。""");

        solution(p9, "递归", """
                中序遍历的定义天然就是递归的：先递归处理左子树，访问自己，再递归处理右子树。
                递归调用栈的高度等于树高 h，平衡时是 O(log n)，最坏（链状树）是 O(n)。""", """
                public List<Integer> inorderTraversal(TreeNode root) {
                    List<Integer> result = new ArrayList<>();
                    inorder(root, result);
                    return result;
                }

                private void inorder(TreeNode node, List<Integer> result) {
                    if (node == null) return;
                    inorder(node.left, result);   // 左
                    result.add(node.val);         // 根
                    inorder(node.right, result);  // 右
                }""", "O(n)", "O(h)");

        Problem p10 = problem("max-depth", "二叉树的最大深度", "EASY", "tree",
                "树,DFS", "binarytree", "O(n)", "O(h)",
                """
                求二叉树从根节点到最远叶子节点的最长路径上的节点数。
                示例：树 [3,9,20,null,null,15,7] 的最大深度是 3（3 -> 20 -> 15 或 7）。""");

        solution(p10, "后序递归", """
                一棵树的深度 = 1 + max(左子树深度, 右子树深度)，空树深度为 0。
                从叶子往上逐层汇答案，是理解"递归返回值"的最佳入门题。""", """
                public int maxDepth(TreeNode root) {
                    if (root == null) return 0;
                    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
                }""", "O(n)", "O(h)");

        Problem p11 = problem("invert-binary-tree", "翻转二叉树", "EASY", "tree",
                "树,DFS", "binarytree", "O(n)", "O(h)",
                """
                把二叉树沿竖直方向镜像翻转：每个节点的左右子树互换。
                示例：树 [4,2,7,1,3,6,9] 翻转后变成 [4,7,2,9,6,3,1]。""");

        solution(p11, "先序递归交换", """
                到每个节点只做一件事：交换它的左右孩子，剩下的交给递归处理。
                可以先交换再递归（先序），也可以先递归再交换（后序），结果一样。""", """
                public TreeNode invertTree(TreeNode root) {
                    if (root == null) return null;
                    TreeNode tmp = root.left;
                    root.left = root.right;
                    root.right = tmp;
                    invertTree(root.left);
                    invertTree(root.right);
                    return root;
                }""", "O(n)", "O(h)");

        Problem p12 = problem("level-order-traversal", "二叉树的层序遍历", "MEDIUM", "tree",
                "树,BFS", "binarytree", "O(n)", "O(n)",
                """
                按层从上到下、每层内从左到右遍历二叉树，返回二维数组。
                示例：树 [3,9,20,null,null,15,7] 输出 [[3], [9, 20], [15, 7]]。""");

        solution(p12, "队列 BFS", """
                广度优先搜索（BFS）用队列实现：每轮循环开始时，队列里恰好装着当前层的全部节点。
                记下队列当前长度 len，弹 len 次（弹出的同时把下一层的节点压入），就把一整层收集完了。""", """
                public List<List<Integer>> levelOrder(TreeNode root) {
                    List<List<Integer>> result = new ArrayList<>();
                    if (root == null) return result;
                    Queue<TreeNode> queue = new LinkedList<>();
                    queue.offer(root);
                    while (!queue.isEmpty()) {
                        int len = queue.size();
                        List<Integer> level = new ArrayList<>();
                        for (int i = 0; i < len; i++) {
                            TreeNode node = queue.poll();
                            level.add(node.val);
                            if (node.left != null) queue.offer(node.left);
                            if (node.right != null) queue.offer(node.right);
                        }
                        result.add(level);
                    }
                    return result;
                }""", "O(n)", "O(n)");

        // ================= 动态规划 =================
        Problem p13 = problem("climbing-stairs", "爬楼梯", "EASY", "dp",
                "动态规划,记忆化", "dp", "O(n)", "O(1)",
                """
                你在爬一个 n 级台阶的楼梯，每次可以爬 1 级或 2 级，问有多少种不同的爬法。
                示例：n = 3 时有 3 种（1+1+1、1+2、2+1）。
                约束：1 <= n <= 45。""");

        solution(p13, "滚动变量（斐波那契）", """
                想站上第 i 级台阶，最后一步要么从第 i-1 级跨 1 步，要么从第 i-2 级跨 2 步。
                所以 f(i) = f(i-1) + f(i-2)——这就是斐波那契数列。
                只需要最近两个值，用两个变量滚动前进即可，不必开数组。""", """
                public int climbStairs(int n) {
                    int prev = 1, cur = 1; // f(0) = f(1) = 1
                    for (int i = 2; i <= n; i++) {
                        int next = prev + cur;
                        prev = cur;
                        cur = next;
                    }
                    return cur;
                }""", "O(n)", "O(1)");

        Problem p14 = problem("max-subarray", "最大子数组和", "MEDIUM", "dp",
                "动态规划,数组", "dp", "O(n)", "O(1)",
                """
                在整数数组中找出一个连续子数组（至少含一个元素），使其和最大，返回这个最大和。
                示例：nums = [-2,1,-3,4,-1,2,1,-5,4]，答案 6（子数组 [4,-1,2,1]）。
                约束：元素范围 -10^4 ~ 10^4，进阶尝试分治解法。""");

        solution(p14, "Kadane 算法", """
                定义 f(i) = "以第 i 个元素结尾"的最大子数组和。
                前面累积的和如果是负数，只会拖累当前元素，不如从当前元素重新开始：
                f(i) = max(nums[i], f(i-1) + nums[i])。
                全局答案就是所有 f(i) 的最大值，一遍扫描完成。""", """
                public int maxSubArray(int[] nums) {
                    int cur = nums[0], best = nums[0];
                    for (int i = 1; i < nums.length; i++) {
                        cur = Math.max(nums[i], cur + nums[i]);
                        best = Math.max(best, cur);
                    }
                    return best;
                }""", "O(n)", "O(1)");

        Problem p15 = problem("coin-change", "零钱兑换", "MEDIUM", "dp",
                "动态规划,完全背包", "dp", "O(amount*n)", "O(amount)",
                """
                给定不同面额的硬币 coins 和一个总金额 amount，计算凑出总金额所需的最少硬币数。
                每种硬币数量无限。凑不出返回 -1。
                示例：coins = [1,2,5]，amount = 11，答案是 3（5+5+1）。""");

        solution(p15, "自底向上完全背包", """
                设 f(a) = 凑出金额 a 的最少硬币数，f(0) = 0。
                对每个金额 a，尝试用每种硬币 c：f(a) = min(f(a), f(a-c) + 1)。
                从小到大算出所有 f(a)，就是"填表"式的动态规划。""", """
                public int coinChange(int[] coins, int amount) {
                    int[] f = new int[amount + 1];
                    Arrays.fill(f, amount + 1); // 用"不可能的大数"代替无穷
                    f[0] = 0;
                    for (int a = 1; a <= amount; a++) {
                        for (int c : coins) {
                            if (c <= a) f[a] = Math.min(f[a], f[a - c] + 1);
                        }
                    }
                    return f[amount] > amount ? -1 : f[amount];
                }""", "O(amount×n)", "O(amount)");

        Problem p16 = problem("longest-increasing-subsequence", "最长递增子序列", "MEDIUM", "dp",
                "动态规划,二分", "dp", "O(n^2) 或 O(n log n)", "O(n)",
                """
                在整数数组中找出最长的严格递增子序列（可以不连续）的长度。
                示例：nums = [10,9,2,5,3,7,101,18]，答案是 4（如 [2,3,7,101]）。""");

        solution(p16, "O(n^2) 经典 DP", """
                设 f(i) = 以第 i 个元素结尾的最长递增子序列长度。
                对每个 i，回头看所有比它小的 j：f(i) = max(f(j)) + 1。
                答案是所有 f(i) 的最大值。进阶：维护一个"牌堆"数组配合二分，可以做到 O(n log n)。""", """
                public int lengthOfLIS(int[] nums) {
                    int[] f = new int[nums.length];
                    Arrays.fill(f, 1);
                    int best = 1;
                    for (int i = 1; i < nums.length; i++) {
                        for (int j = 0; j < i; j++) {
                            if (nums[j] < nums[i]) f[i] = Math.max(f[i], f[j] + 1);
                        }
                        best = Math.max(best, f[i]);
                    }
                    return best;
                }""", "O(n^2)", "O(n)");

        // ================= 图 =================
        Problem p17 = problem("number-of-islands", "岛屿数量", "MEDIUM", "graph",
                "DFS,BFS,矩阵", "graph", "O(m*n)", "O(m*n)",
                """
                给一个 m×n 的二维网格，'1' 是陆地、'0' 是水，上下左右相连的陆地算同一个岛，求岛的数量。
                示例：3×3 网格全为 '1' 时答案是 1。
                约束：网格最大 300×300。""");

        solution(p17, "FloodFill DFS", """
                遍历整个网格，每发现一块没访问过的陆地，就说明发现了一个新岛。
                然后从这点出发做 DFS，把整个岛（四连通的陆地）全部"淹掉"标记为已访问，
                这样每个岛只会被计数一次。类似洪水蔓延填满整个区域，所以叫 FloodFill。""", """
                public int numIslands(char[][] grid) {
                    int count = 0;
                    for (int i = 0; i < grid.length; i++) {
                        for (int j = 0; j < grid[0].length; j++) {
                            if (grid[i][j] == '1') {
                                count++;
                                dfs(grid, i, j);
                            }
                        }
                    }
                    return count;
                }

                private void dfs(char[][] grid, int i, int j) {
                    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length
                            || grid[i][j] != '1') return;
                    grid[i][j] = '0'; // 标记为已访问
                    dfs(grid, i + 1, j);
                    dfs(grid, i - 1, j);
                    dfs(grid, i, j + 1);
                    dfs(grid, i, j - 1);
                }""", "O(m×n)", "O(m×n)");

        Problem p18 = problem("course-schedule", "课程表", "MEDIUM", "graph",
                "拓扑排序,BFS", "graph", "O(V+E)", "O(V+E)",
                """
                共 numCourses 门课，某些课有先修要求：prerequisites[i] = [a, b] 表示学 a 之前必须先学 b。
                判断是否能修完全部课程（即先修关系图不存在环）。
                示例：2 门课，先修 [1,0]，可以先学 0 再学 1，返回 true。""");

        solution(p18, "Kahn 拓扑排序（BFS）", """
                把课程看成节点、先修要求看成有向边，问题变成：这个有向图是不是无环的？
                统计每个节点的入度，把入度为 0 的节点（没有先修要求的课）全部入队；
                每处理一个节点，就把它指向的节点入度减 1，减到 0 就入队。
                最后数一下处理过的节点数：全部处理完说明无环，否则有环。""", """
                public boolean canFinish(int numCourses, int[][] prerequisites) {
                    List<List<Integer>> graph = new ArrayList<>();
                    int[] inDegree = new int[numCourses];
                    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
                    for (int[] p : prerequisites) {
                        graph.get(p[1]).add(p[0]);
                        inDegree[p[0]]++;
                    }
                    Queue<Integer> queue = new LinkedList<>();
                    for (int i = 0; i < numCourses; i++) {
                        if (inDegree[i] == 0) queue.offer(i);
                    }
                    int taken = 0;
                    while (!queue.isEmpty()) {
                        int cur = queue.poll();
                        taken++;
                        for (int next : graph.get(cur)) {
                            if (--inDegree[next] == 0) queue.offer(next);
                        }
                    }
                    return taken == numCourses;
                }""", "O(V+E)", "O(V+E)");

        // ================= 回溯 =================
        Problem p19 = problem("permutations", "全排列", "MEDIUM", "backtracking",
                "回溯", "backtracking", "O(n×n!)", "O(n)",
                """
                给一个不含重复数字的数组，返回所有可能的全排列。
                示例：nums = [1,2,3]，输出 [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]。""");

        solution(p19, "回溯 + used 数组", """
                回溯就是"做选择 -> 探索 -> 撤销选择"的循环。
                每一层从还没用过的数字里挑一个放进当前排列；排列满了记录答案；
                返回上一层时把刚才的选择撤销，换下一个数字再试。决策树的所有叶子就是全部排列。""", """
                public List<List<Integer>> permute(int[] nums) {
                    List<List<Integer>> result = new ArrayList<>();
                    backtrack(nums, new boolean[nums.length], new ArrayList<>(), result);
                    return result;
                }

                private void backtrack(int[] nums, boolean[] used,
                                       List<Integer> path, List<List<Integer>> result) {
                    if (path.size() == nums.length) {
                        result.add(new ArrayList<>(path));
                        return;
                    }
                    for (int i = 0; i < nums.length; i++) {
                        if (used[i]) continue;
                        used[i] = true;          // 做选择
                        path.add(nums[i]);
                        backtrack(nums, used, path, result); // 探索
                        path.remove(path.size() - 1);        // 撤销选择
                        used[i] = false;
                    }
                }""", "O(n×n!)", "O(n)");

        // ================= 设计 =================
        Problem p20 = problem("lru-cache", "LRU 缓存", "MEDIUM", "stack",
                "设计,哈希表,链表", null, "O(1) 每操作", "O(capacity)",
                """
                设计一个容量为 capacity 的 LRU（最近最少使用）缓存：
                get(key)：存在则返回值并把它标记为"最近使用"，不存在返回 -1；
                put(key, value)：写入键值对；容量超限时淘汰"最久未使用"的键。
                两个操作都要求 O(1) 时间。""");

        solution(p20, "哈希表 + 双向链表", """
                哈希表查找快但记不住顺序，链表记顺序但查找慢，把两者拼起来就都是 O(1)。
                双向链表按使用时间排列：头部是最新、尾部是最旧；
                哈希表 key -> 链表节点。访问某 key 就把它的节点摘下来挂到头部；
                容量满了就从尾部删节点，同时删掉哈希表里的对应项。""", """
                class LRUCache {
                    private final int capacity;
                    private final Map<Integer, Node> map = new HashMap<>();
                    private final Node head = new Node(); // 哑头，最新一侧
                    private final Node tail = new Node(); // 哑尾，最旧一侧

                    private static class Node {
                        int key, value;
                        Node prev, next;
                    }

                    public LRUCache(int capacity) {
                        this.capacity = capacity;
                        head.next = tail;
                        tail.prev = head;
                    }

                    public int get(int key) {
                        Node node = map.get(key);
                        if (node == null) return -1;
                        moveToFront(node);
                        return node.value;
                    }

                    public void put(int key, int value) {
                        Node node = map.get(key);
                        if (node != null) {
                            node.value = value;
                            moveToFront(node);
                            return;
                        }
                        if (map.size() == capacity) {
                            Node oldest = tail.prev;
                            unlink(oldest);
                            map.remove(oldest.key);
                        }
                        Node fresh = new Node();
                        fresh.key = key;
                        fresh.value = value;
                        map.put(key, fresh);
                        addToFront(fresh);
                    }

                    private void unlink(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
                    private void addToFront(Node n) {
                        n.next = head.next; n.prev = head;
                        head.next.prev = n; head.next = n;
                    }
                    private void moveToFront(Node n) { unlink(n); addToFront(n); }
                }""", "O(1)", "O(capacity)");
    }
}
