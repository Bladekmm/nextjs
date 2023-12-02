pragma solidity ^0.8.6;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OmoovToken is ERC20 {
address owner = 0x3FA61f8DEFd14Ac4429Eb87f101E23A550e3E41b;
// 评论与用户地址的映射
mapping(string => address) private _commentToAddress;
// 储存用户对某一商家的评论 
mapping(address => mapping(string => address)) _usercommenttoMerchant;
// 用户每天的点赞数
mapping(address => uint256) private _dailyLikes;
// 上次点赞的日期
mapping(address => uint256) private _lastLikedDay;
// 评论的点赞数
mapping(string => uint) private _commentLikes;
// 评论的点踩数
mapping(string => uint) private _commentDislikes;
// 商家地址的映射
mapping(string => address) private _merchantAddresses;
// 商家的优惠券价值上限，单位是港币
mapping(address => uint) private _merchantCouponLimit;
// 记录所有用户的评论及评论数
string[] public Comments;
// 记录用户个人的评论
mapping(address => string[]) private usercomments;
// 平台收回代币的地址
address private _platformAddress;
// 检查用户是否注册
mapping(address => bool) private _registeredUsers;
// 检查商家是否注册
mapping(address => bool) private _registeredMerchants;
// 用户获取的CoupondRate
mapping(address => uint256) private coupondRate;
// 用户兑换的相应商家的优惠券金额
mapping(address => uint256) private _exchangedCouponAmount;
// 用户注册时触发事件
event UserRegistered(address indexed userAddress, string name);
// 商户注册时触发事件
event MerchantRegistered(address indexed merchantAddress, string name);
// 生成订单ID时触发事件
event OrderIDgenerated(uint256 orderID, address indexed ordertoMerchant);
// 用户发布评论时触发事件
event CommentPosted(address indexed _commentToAddress,string comment);
// 用户获取代币时触发事件
event Tokenminted(address indexed _commentToAddress);
// 用户对评论点赞时触发事件
event CommentLiked(address indexed likeraddress, uint commentlikes);
// 用户对评论点踩时触发事件
event CommentDisliked(address indexed dislikeraddress, uint commentlikes);
// 商家重设优惠券上限时触发事件
event Couponlimitsetted(address indexed merchant,uint256 _merchantCouponLimit);
// 用户兑换优惠券时触发事件
event CouponsExchanged(address indexed user, address indexed merchant, uint256 couponAmount);

constructor() ERC20("Omoov Token", "OMV") {
    _mint(owner, 10000000);
}


//用户注册函数
function registerUser(string memory _name) public {
    require(!_registeredUsers[msg.sender], "User already registered");
    _registeredUsers[msg.sender] = true;
    // 触发事件
    emit UserRegistered(msg.sender,_name);
}

uint256 public constant INITIAL_COUPON_LIMIT = 3000;

// 商户注册函数
function registerMerchant(string memory _name) public {
    require(!_registeredMerchants[msg.sender], "Merchant already registered");
    _registeredMerchants[msg.sender] = true;
    // 进行其他必要的初始化，如设置优惠券限额
    _merchantCouponLimit[msg.sender] = INITIAL_COUPON_LIMIT;
    emit MerchantRegistered(msg.sender, _name);
}

function initializeMerchants() internal {
    registerMerchant("KFC");
    registerMerchant("Starbucks");
    registerMerchant("Subway");
}

// 检查商户的注册状态
function isMerchantRegistered() public view returns (bool) {
    return _registeredMerchants[msg.sender];
}

// 检查用户注册状态
function isUserRegistered() public view returns (bool) {
    return _registeredUsers[msg.sender];
}


function getMerchantAddress(string memory merchant) external view returns (address){
    return _merchantAddresses[merchant];
}

function mintToken(string memory comment) public {

    
    // 确保用户已注册
    require(isUserRegistered(),"You are not a registered user");
    
    // 将评论与发帖用户的地址绑定
    _commentToAddress[comment] = msg.sender;


    // 每条评论铸造一个代币
    _mint(msg.sender, 1);

    //将评论储存
    Comments.push(comment);

    //将评论储存在用户地址下
    usercomments[msg.sender].push(comment);

    emit CommentPosted(msg.sender,comment);

    emit Tokenminted(msg.sender);
}

function likeComment(string memory comment) public {
    // 获取当前日期
    require(isUserRegistered(),"You are not a registered user");
    require(_commentToAddress[comment]!=msg.sender,"You cannot like your own comments!");
    uint256 currentDay = block.timestamp / 1 days; 

    // 如果是新的一天，重置点赞数
    if(_lastLikedDay[msg.sender] < currentDay){
        _dailyLikes[msg.sender] = 0;
        _lastLikedDay[msg.sender] = currentDay;
    }

    // 确保用户每天最多只能点赞五次
    require(_dailyLikes[msg.sender] < 5, "You have exceeded the daily like limit");

    // 点赞
    _dailyLikes[msg.sender]++;
    _commentLikes[comment]++;
    
    emit CommentLiked(msg.sender, _commentLikes[comment]);
}

function dislikeComment(string memory comment) public {
    // 确保用户有足够的代币
    require(isUserRegistered(),"You are not a registered user");
    require(balanceOf(msg.sender) >= 1, "You do not have enough tokens");

    // 扣除一个代币
    _transfer(msg.sender, owner, 1);

    // 抵消两个赞
    if (_commentLikes[comment] >= 2) {
        _commentLikes[comment] -= 2;
        } else {
        _commentLikes[comment] = 0;
    }

    _commentDislikes[comment]++;

    emit CommentDisliked(msg.sender, _commentLikes[comment]);
}

function getBalance() public view returns (uint256) {
    return balanceOf(msg.sender);
}

function getCommentAuthor(string memory comment) public view returns (address) {
    return _commentToAddress[comment];
}

function getCommentLikes(string memory comment) public view returns (uint256) {
    return _commentLikes[comment];
}

function getCommentDislikes(string memory comment) public view returns (uint256) {
    return _commentDislikes[comment];
}

function getComments() public view returns (string[] memory){
    return Comments;
}

function getCommentCounts() public view returns (uint256){
    return Comments.length;
}

function GetNthComment(uint256 x) view public returns(string memory){
        return Comments[x];
}

function getTotalLikes() public view returns (uint256) {
    uint256 totalLikes = 0;
    for (uint256 i = 0; i < Comments.length; i++) {
        if (getCommentAuthor(Comments[i]) == msg.sender) {
            totalLikes += _commentLikes[Comments[i]];
        }
    }
    return totalLikes;
}

function getCouponRate() public view returns (uint256) {

    uint256 totalLikes = getTotalLikes();
    uint256 CouponRate = 101;
    // 根据点赞数计算兑换汇率
    if (totalLikes <= 10000) {
        CouponRate = 100 * ( 10000-totalLikes )/10000 + 1;
    } else {
        uint256 likesExceed = totalLikes / 10000;
        CouponRate = 100 * (10000-likesExceed)/10000 + 1;
    }
    return CouponRate;
}

function exchangeCoupon(address merchant,uint256 coupon) external {
    require(isUserRegistered(),"You are not a registered user");

    //确认商家有足够优惠券可供兑换
    require(_merchantCouponLimit[merchant] > coupon, "No remaining coupon");

    uint exchangeRate = getCouponRate();

    //计算兑换所需Token
    uint Tokenneed = coupon * exchangeRate;
    
    //确保用户有足够的Token
    require(balanceOf(msg.sender) >= Tokenneed, "Not enough tokens to claim the coupon");

    //更新商家优惠券余额
    _merchantCouponLimit[merchant] -= coupon;
        
    //更新用户所兑换优惠券余额
    _exchangedCouponAmount[msg.sender] += coupon;

    //用户将Token转给商家
    _transfer(msg.sender, merchant, coupon);

    emit CouponsExchanged(msg.sender, merchant, coupon);
    }


// 设置优惠券上限的函数，只有商家才能调用
    function setMerchantCouponLimit(uint256 limit) public {
        require(isMerchantRegistered(), "Only the merchant can set the coupon limit");
        require(limit >= 3000, "The coupon limit must be at least 3000 HKD");

        _merchantCouponLimit[msg.sender] = limit;
    }

    // 获取优惠券上限的函数
    function getMerchantCouponLimit(address merchant) public view returns (uint256) {
        return _merchantCouponLimit[merchant];
    }
    // 获取用户已兑换相关商家优惠券金额的函数
    function getexchangedCouponAmount() public view returns (uint256) {
        return _exchangedCouponAmount[msg.sender];
    }
}